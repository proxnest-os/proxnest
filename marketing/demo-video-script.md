# ProxNest — 2-Minute Demo Video Script

---

## Runtime: ~2:00

### [0:00–0:10] Hook

**On screen:** Text overlay on dark background: "What if you could turn any PC into a media server in 5 minutes?"

**Voiceover:** "Setting up a home server usually takes hours. Proxmox, Docker, networking, configs… What if it took five minutes?"

---

### [0:10–0:30] Scene 1: Boot from ISO → First Boot Wizard

**On screen:** PC booting from USB. ProxNest installer loads. Clean setup wizard with 4 steps: language, disk selection, network config, admin password.

**Voiceover:** "Flash the ProxNest ISO to a USB drive, boot up, and walk through the setup wizard. Pick your disk, set a password — that's it. ProxNest installs Proxmox VE underneath and configures everything automatically."

**Action:** Click through wizard steps quickly. Show progress bar. Installation completes, system reboots.

---

### [0:30–0:50] Scene 2: Cloud Dashboard → Claim Server

**On screen:** Open browser, navigate to cloud.proxnest.com. Dashboard shows "1 server waiting to be claimed." Click "Claim."

**Voiceover:** "Head to cloud.proxnest.com and your server is already waiting. Click claim, give it a name, and you've got remote access — no port forwarding, no dynamic DNS, no VPN setup."

**Action:** Claim server. Dashboard populates with server overview: hostname, IP, CPU/RAM usage, storage.

---

### [0:50–1:15] Scene 3: Install Media Server Stack (One Click)

**On screen:** Navigate to "Stacks" tab. Show 8 available stacks. Click "Media Server" stack. Modal shows included apps: Jellyfin, Sonarr, Radarr, Prowlarr, qBittorrent. Click "Install."

**Voiceover:** "Go to Stacks and pick Media Server. One click installs Jellyfin, Sonarr, Radarr, Prowlarr, and qBittorrent — each in its own isolated LXC container with dedicated CPU and RAM."

**Action:** Click install. Show progress: containers being created one by one with status indicators. ~15 seconds of sped-up installation footage.

---

### [1:15–1:30] Scene 4: Auto-Wiring in Action

**On screen:** Installation completes. Show "Auto-wiring..." status. Then show Sonarr's settings page — download client already configured with qBittorrent's address and API key. Show Prowlarr — indexers already pushed to Sonarr and Radarr.

**Voiceover:** "Here's the magic — apps auto-wire themselves. Sonarr already knows about qBittorrent. Prowlarr already pushed indexers to Sonarr and Radarr. Jellyfin is pointed at your media directories. Zero manual configuration."

**Action:** Quick cuts between app settings pages showing pre-configured connections.

---

### [1:30–1:45] Scene 5: Access Jellyfin, Add Media

**On screen:** Click Jellyfin from dashboard. Jellyfin opens. Library already configured. Add a movie via Radarr (quick search, click add). Show it appearing in Jellyfin's library.

**Voiceover:** "Open Jellyfin and your libraries are ready. Search for a movie in Radarr, add it, and it flows through the entire pipeline — downloaded, organized, and available to stream."

**Action:** Search movie in Radarr → add → cut to Jellyfin showing the movie in library.

---

### [1:45–2:00] Scene 6: Resource Monitoring + Closing

**On screen:** Back to ProxNest dashboard. Show per-container resource view: each app with its own CPU%, RAM, disk usage bars. Expand one container to show detailed metrics.

**Voiceover:** "Monitor every app individually. See exactly what's using your resources. And remember — this is Proxmox underneath. You've got ZFS, VMs, snapshots, and full shell access whenever you need it."

**On screen:** Fade to ProxNest logo. Text: "proxnest.com — Free & Open Source. Turn any PC into a media server in 5 minutes."

**Voiceover:** "ProxNest. Free, open source, and built on Proxmox. Try it at proxnest.com."

---

## Production Notes

- **Music:** Upbeat, tech-forward background track. Low volume under voiceover.
- **Pacing:** Fast cuts, no dead time. Speed up installation footage 4–8x.
- **Resolution:** Record at 1080p minimum, 4K preferred.
- **Annotations:** Use subtle callout boxes to highlight key UI elements.
- **End card:** Include GitHub link, QR code to proxnest.com, and "Star us on GitHub" CTA.
