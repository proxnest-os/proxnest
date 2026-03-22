# ProxNest — Product Hunt Launch Draft

---

## Tagline

**Turn any PC into a media server in 5 minutes**

---

## Description

**The problem:** Setting up a home server shouldn't require a CS degree. You want Jellyfin, Sonarr, Nextcloud, maybe Home Assistant — but you spend hours wrestling with Docker Compose files, reverse proxies, API keys, and network configs. Alternatives like Hexos charge $200+ and lock you into their cloud. Your hardware, their rules.

**The solution:** ProxNest is a free NAS operating system built on Proxmox VE — the same enterprise hypervisor used in production data centers. Flash the ISO, answer a few questions in the setup wizard, and claim your server from the cloud dashboard. Install a complete media server stack with one click. Apps auto-wire themselves: Sonarr knows your download client, Jellyfin finds your media libraries, Prowlarr pushes indexers everywhere they need to go. Each app runs in its own isolated LXC container, so nothing steps on anything else.

**Why ProxNest:** Unlike Hexos ($200+ license, cloud-dependent, closed source), ProxNest is free and open source. The free tier includes unlimited app installs with full local management. Pro ($5/mo) adds the cloud dashboard for remote access — no port forwarding needed. You get the simplicity of a consumer NAS OS with the power of Proxmox underneath: ZFS support, VM creation, proper resource isolation, and full shell access when you want it.

---

## Key Features

- 🚀 **5-minute setup** — Boot from ISO, run the wizard, claim your server. Done.
- 📦 **36 apps, 8 stacks** — Jellyfin, Sonarr, Radarr, Nextcloud, Immich, Home Assistant, Vaultwarden, and more
- 🔗 **Auto-wiring** — Apps configure themselves to work together. No manual API key copying.
- 🏗️ **True isolation** — Each app in its own LXC container with dedicated resources
- ☁️ **Cloud dashboard** — Manage your server from anywhere at cloud.proxnest.com
- 🔒 **VPN built in** — WireGuard and Tailscale integration for secure remote access
- 💾 **Automated backups** — Per-app or full-system backup scheduling
- 🆓 **Free & open source** — No license fees, no vendor lock-in. Pro cloud access just $5/mo.

---

## Maker Comment

Hey Product Hunt! 👋

I'm the maker of ProxNest. Here's the backstory:

I've been running a Proxmox home server for years. Every time I rebuilt it, I'd spend an entire weekend setting up LXC containers, installing apps, configuring them to talk to each other, setting up reverse proxies... you know the drill.

I looked at Hexos — it promised to solve this — but the $200 price tag, cloud dependency, and bugs made me think: "I can build something better on top of the hypervisor I already trust."

So I did. ProxNest is Proxmox underneath with a friendly layer on top. It auto-provisions isolated containers, installs apps, and — the part I'm most proud of — **auto-wires them together**. Install the media server stack and Sonarr already has your download client configured, Jellyfin already sees your media. Zero manual config.

The free tier is fully functional. Pro ($5/mo) just adds the cloud dashboard for remote management. No artificial limitations on the free tier.

It's open source on GitHub: github.com/meyerg27/proxnest

I'd love your feedback — what apps should I add next? What would make this your go-to NAS OS?

---

## Gallery Suggestions

1. Dashboard overview showing installed apps with resource usage
2. One-click stack installation flow
3. Auto-wiring in action (before/after app configuration)
4. Cloud dashboard remote management view
5. Web terminal accessing a container
6. Setup wizard (ISO boot → first screen)
