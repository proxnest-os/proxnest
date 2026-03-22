# ProxNest — Twitter/X Launch Thread

---

## Tweet 1 (Hook)

I just open-sourced a NAS OS that turns any PC into a media server in 5 minutes.

No Docker Compose files. No manual configs. No $200 license fees.

It's built on Proxmox VE, and it's free.

Meet ProxNest 🧵👇

---

## Tweet 2 (The Problem)

Setting up a home server today:

❌ Hours configuring Docker containers
❌ Manually wiring Sonarr → qBittorrent → Jellyfin
❌ Fighting with reverse proxies
❌ Hexos wants $200+ and depends on their cloud

There had to be a better way.

---

## Tweet 3 (The Solution)

ProxNest:

✅ Flash ISO → boot → 5 min setup wizard
✅ 36 apps, 8 one-click stacks
✅ Apps auto-wire themselves (Sonarr already knows your download client)
✅ Each app in its own LXC container — true isolation
✅ Cloud dashboard for remote access — no port forwarding

---

## Tweet 4 (Architecture)

The architecture is what I'm most proud of:

→ Proxmox VE underneath (enterprise hypervisor)
→ Each app = its own LXC container with Docker inside
→ Agent on host handles provisioning + auto-wiring
→ Inter-container API calls configure app connections
→ You keep full PVE access: ZFS, VMs, shell, everything

---

## Tweet 5 (Pricing)

Pricing:

🆓 Free tier — unlimited apps, full local management, forever
💎 Pro — $5/mo for cloud dashboard (remote access, no port forwarding)

Compare that to Hexos: $200+ license, cloud-dependent, closed source, and honestly kind of buggy.

---

## Tweet 6 (CTA)

Try it:

🌐 proxnest.com
☁️ cloud.proxnest.com
⭐ github.com/meyerg27/proxnest

I'd love feedback — what apps should I add? What's missing?

RT if you think home servers should be easier. 🔁
