<p align="center">
  <img src="https://proxnest.com/og-image.png" alt="ProxNest" width="600" />
</p>

<h1 align="center">ProxNest 🏠</h1>

<p align="center">
  <strong>The home server OS that doesn't suck.</strong><br />
  Install one ISO. Click "Media Server." Watch 6 apps install, auto-configure, and connect themselves.
</p>

<p align="center">
  <a href="https://proxnest.com">Website</a> •
  <a href="https://cloud.proxnest.com">Cloud Dashboard</a> •
  <a href="https://discord.gg/b4NGUMYU34">Discord</a> •
  <a href="./docs/README.md">Documentation</a>
</p>

<p align="center">
  <a href="https://discord.gg/b4NGUMYU34"><img src="https://img.shields.io/discord/1485446431765696674?color=5865F2&label=Discord&logo=discord&logoColor=white" alt="Discord" /></a>
  <a href="https://github.com/meyerg27/proxnest/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-AGPLv3-blue.svg" alt="License" /></a>
  <a href="https://github.com/meyerg27/proxnest/releases"><img src="https://img.shields.io/github/v/release/meyerg27/proxnest?label=version" alt="Version" /></a>
</p>

---

## ⚡ Quick Start

```bash
# 1. Install on existing Proxmox (one command)
curl -fsSL https://proxnest.com/install.sh | bash

# 2. Open the dashboard
open https://your-server-ip:3000

# 3. Install your first app stack
# Dashboard → App Store → Media Server → Install Stack
```

Or [download the ISO](https://github.com/meyerg27/proxnest/releases/download/v0.4.0/proxnest-0.4.0.iso) for a fresh install.

---

## ✨ Features

- 🖱️ **One-Click App Stacks** — Install 6+ apps with one click, auto-configured and auto-wired
- 📦 **100+ Apps** — Media, downloads, cloud storage, home automation, monitoring, AI, gaming
- 💽 **Storage Wizard** — Guided ZFS/ext4 setup with disk roles (media, downloads, backups)
- 🌐 **Cloud Dashboard** — Manage from anywhere via [cloud.proxnest.com](https://cloud.proxnest.com)
- 🔒 **Local-First** — Everything runs on your hardware. Cloud is optional.
- 🖥️ **Web Terminal** — Full shell access from your browser
- 🔗 **Auto-Wiring** — Radarr finds qBit, Prowlarr syncs indexers, no manual config
- 💾 **One-Click Backups** — Back up and restore all app configs instantly
- 📊 **Real-Time Monitoring** — CPU, RAM, storage, network stats at a glance
- 🔐 **Built-in VPN** — WireGuard + OpenVPN for secure torrent traffic and remote access
- 🤖 **AI Ready** — Run Ollama, Open WebUI, Stable Diffusion locally

---

## 📸 Screenshots

<p align="center">
  <img src="https://proxnest.com/screenshots/ss-overview.png" alt="Dashboard Overview" width="800" /><br />
  <em>Dashboard — System stats, quick actions, getting started guide</em>
</p>

<p align="center">
  <img src="https://proxnest.com/screenshots/ss-storage.png" alt="Storage Wizard" width="800" /><br />
  <em>Storage Wizard — Detect disks, manage pools, assign roles</em>
</p>

---

## 🆚 How We Compare

| | Hexos | Unraid | **ProxNest** |
|---|---|---|---|
| **Price** | $200 | $60-130 | **Free + $5/mo Pro** |
| **Base OS** | TrueNAS | Custom Linux | **Proxmox VE** |
| **Cloud Required** | Yes ❌ | No | **No ✅** |
| **Virtual Machines** | Limited | Basic KVM | **Full KVM ✅** |
| **Containers** | Docker | Docker | **Docker + LXC ✅** |
| **ZFS Support** | Via TrueNAS | Plugin | **Native ✅** |
| **App Store** | Limited | Community | **100+ curated ✅** |
| **Open Source** | No | Partial | **Core: yes ✅** |

---

## 📖 Documentation

| Guide | Description |
|-------|-------------|
| [Installation](docs/INSTALLATION.md) | System requirements, ISO flashing, setup wizard |
| [Apps & Stacks](docs/APPS.md) | All 100+ apps, 8 curated stacks, auto-wiring |
| [Storage](docs/STORAGE.md) | Storage wizard, ZFS basics, disk roles |
| [Networking](docs/NETWORKING.md) | VPN, reverse proxy, remote access, DNS |
| [Backups](docs/BACKUPS.md) | Backup manager, scheduling, restore |
| [FAQ](docs/FAQ.md) | Common questions and troubleshooting |
| [Contributing](docs/CONTRIBUTING.md) | How to contribute to ProxNest |

---

## 💬 Community

[![Discord](https://img.shields.io/discord/1485446431765696674?color=5865F2&label=Join%20Discord&logo=discord&logoColor=white&style=for-the-badge)](https://discord.gg/b4NGUMYU34)

- **[Discord Server](https://discord.gg/b4NGUMYU34)** — Get help, share your builds, request features, chat with the community
- **[GitHub Issues](https://github.com/meyerg27/proxnest/issues)** — Bug reports
- **[GitHub Discussions](https://github.com/meyerg27/proxnest/discussions)** — Feature requests & questions

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                   ProxNest Stack                     │
├─────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐                 │
│  │ Cloud Dashboard│  │ Landing Page │  React + TS    │
│  │ (cloud.proxnest│  │ (proxnest.com│  + Tailwind    │
│  │  .com)        │  │  )           │                 │
│  └──────┬───────┘  └──────────────┘                 │
│         │                                            │
│  ┌──────┴───────┐                                   │
│  │  ProxNest API │  Node.js + Fastify               │
│  └──────┬───────┘                                   │
│         │                                            │
│  ┌──────┴───────┐                                   │
│  │  ProxNest    │  System daemon (WebSocket)        │
│  │  Agent       │                                    │
│  └──────┬───────┘                                   │
│         │                                            │
│  ┌──────┴───────┐                                   │
│  │  Proxmox VE  │  KVM, LXC, ZFS, Networking       │
│  └──────────────┘                                   │
└─────────────────────────────────────────────────────┘
```

---

## 🛠️ Development

```bash
# Clone
git clone https://github.com/meyerg27/proxnest.git
cd proxnest

# Landing page
cd landing && npm install && npm run dev

# Cloud dashboard
cd cloud/dashboard && npm install && npm run dev

# API server
cd api && npm install && npm run dev
```

See [CONTRIBUTING.md](docs/CONTRIBUTING.md) for the full development guide.

---

## 📜 License

Dual-licensed: Open-source core ([AGPLv3](LICENSE)) + Commercial features (proprietary).

---

<p align="center">
  <strong>Made with ❤️ for the self-hosted community</strong><br />
  <a href="https://discord.gg/b4NGUMYU34">Join us on Discord</a> •
  <a href="https://proxnest.com">proxnest.com</a>
</p>
