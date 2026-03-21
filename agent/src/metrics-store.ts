/**
 * ProxNest Agent — Metrics Store
 * Stores heartbeat metrics in a local SQLite database for historical graphs.
 * Retains up to 7 days of data (configurable), auto-prunes on insert.
 */

import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import type { Logger } from './logger.js';

// ─── Types ────────────────────────────────────

export interface MetricRow {
  ts: number;         // Unix epoch seconds
  cpu: number;        // CPU usage percent
  ram_used: number;   // RAM used MB
  ram_total: number;  // RAM total MB
  disk_used: number;  // Disk used GB
  disk_total: number; // Disk total GB
  load_avg: number;   // 1-min load average
  guests_running: number;
  guests_stopped: number;
}

export interface MetricsQueryResult {
  points: MetricRow[];
  from: number;
  to: number;
  count: number;
  interval: string;
}

// ─── Store Class ──────────────────────────────

export class MetricsStore {
  private db: Database.Database;
  private log: Logger;
  private insertStmt: Database.Statement;
  private retentionMs: number;
  private pruneCounter = 0;

  constructor(dbPath: string, logger: Logger, retentionDays = 7) {
    this.log = logger;
    this.retentionMs = retentionDays * 24 * 60 * 60 * 1000;

    // Ensure directory exists
    mkdirSync(dirname(dbPath), { recursive: true });

    this.db = new Database(dbPath);

    // WAL mode for better concurrent read/write
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('synchronous = NORMAL');

    // Create table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS metrics (
        ts         INTEGER NOT NULL,
        cpu        REAL    NOT NULL,
        ram_used   REAL    NOT NULL,
        ram_total  REAL    NOT NULL,
        disk_used  REAL    NOT NULL,
        disk_total REAL    NOT NULL,
        load_avg   REAL    NOT NULL DEFAULT 0,
        guests_running INTEGER NOT NULL DEFAULT 0,
        guests_stopped INTEGER NOT NULL DEFAULT 0
      );
      CREATE INDEX IF NOT EXISTS idx_metrics_ts ON metrics(ts);
    `);

    this.insertStmt = this.db.prepare(`
      INSERT INTO metrics (ts, cpu, ram_used, ram_total, disk_used, disk_total, load_avg, guests_running, guests_stopped)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    this.log.info({ dbPath, retentionDays }, 'Metrics store initialized');
  }

  /**
   * Record a heartbeat data point.
   */
  record(data: {
    cpu: number;
    ramUsedMB: number;
    ramTotalMB: number;
    diskUsedGB: number;
    diskTotalGB: number;
    loadAvg?: number;
    guestsRunning?: number;
    guestsStopped?: number;
  }): void {
    const ts = Math.floor(Date.now() / 1000);
    try {
      this.insertStmt.run(
        ts,
        data.cpu,
        data.ramUsedMB,
        data.ramTotalMB,
        data.diskUsedGB,
        data.diskTotalGB,
        data.loadAvg ?? 0,
        data.guestsRunning ?? 0,
        data.guestsStopped ?? 0,
      );

      // Prune old data every ~60 inserts (~30 minutes at 30s intervals)
      this.pruneCounter++;
      if (this.pruneCounter >= 60) {
        this.prune();
        this.pruneCounter = 0;
      }
    } catch (err) {
      this.log.error({ err }, 'Failed to record metric');
    }
  }

  /**
   * Query historical metrics.
   * @param range - Time range: '1h', '6h', '24h', '7d'
   * @param maxPoints - Max data points to return (downsamples if needed)
   */
  query(range: string = '24h', maxPoints = 300): MetricsQueryResult {
    const now = Math.floor(Date.now() / 1000);
    const rangeMs = this.parseRange(range);
    const from = now - Math.floor(rangeMs / 1000);

    // Count total points in range
    const countResult = this.db.prepare(
      'SELECT COUNT(*) as cnt FROM metrics WHERE ts >= ?'
    ).get(from) as { cnt: number };

    const totalPoints = countResult.cnt;

    let points: MetricRow[];

    if (totalPoints <= maxPoints) {
      // Return all points
      points = this.db.prepare(
        'SELECT ts, cpu, ram_used, ram_total, disk_used, disk_total, load_avg, guests_running, guests_stopped FROM metrics WHERE ts >= ? ORDER BY ts ASC'
      ).all(from) as MetricRow[];
    } else {
      // Downsample using GROUP BY with bucket intervals
      const bucketSize = Math.ceil((now - from) / maxPoints);
      points = this.db.prepare(`
        SELECT
          (ts / ? * ?) as ts,
          ROUND(AVG(cpu), 1) as cpu,
          ROUND(AVG(ram_used), 0) as ram_used,
          ROUND(MAX(ram_total), 0) as ram_total,
          ROUND(AVG(disk_used), 1) as disk_used,
          ROUND(MAX(disk_total), 1) as disk_total,
          ROUND(AVG(load_avg), 2) as load_avg,
          ROUND(AVG(guests_running), 0) as guests_running,
          ROUND(AVG(guests_stopped), 0) as guests_stopped
        FROM metrics
        WHERE ts >= ?
        GROUP BY ts / ?
        ORDER BY ts ASC
      `).all(bucketSize, bucketSize, from, bucketSize) as MetricRow[];
    }

    return {
      points,
      from,
      to: now,
      count: points.length,
      interval: range,
    };
  }

  /**
   * Delete metrics older than retention period.
   */
  private prune(): void {
    const cutoff = Math.floor((Date.now() - this.retentionMs) / 1000);
    const result = this.db.prepare('DELETE FROM metrics WHERE ts < ?').run(cutoff);
    if (result.changes > 0) {
      this.log.debug({ deleted: result.changes }, 'Pruned old metrics');
    }
  }

  private parseRange(range: string): number {
    const match = range.match(/^(\d+)([hmd])$/);
    if (!match) return 24 * 60 * 60 * 1000; // default 24h
    const val = parseInt(match[1], 10);
    switch (match[2]) {
      case 'h': return val * 60 * 60 * 1000;
      case 'd': return val * 24 * 60 * 60 * 1000;
      case 'm': return val * 60 * 1000;
      default: return 24 * 60 * 60 * 1000;
    }
  }

  close(): void {
    this.db.close();
  }
}
