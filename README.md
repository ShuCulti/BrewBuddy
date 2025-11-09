# Brew Buddy Monorepo

Brew Buddy keeps a shared house stocked and transparent: roommates log every drink with one tap, the inventory updates in real time for everyone, low stock items auto-populate the shopping list, and monthly costs are split based on actual consumption.

## Tech Stack

```
brewbuddy-app/
├── backend/        Django 5 + DRF + Channels API (SQLite by default)
└── src/           React (Vite + JSX) dashboard with WebSocket updates
```

Key backend capabilities:

- Inventory, purchases, consumption logs, and auto-generated shopping list entries.
- Monthly cost split calculation per housemate.
- WebSocket stream (`/ws/inventory/`) powered by Django Channels for live UI refreshes.

Key frontend capabilities:

- Real-time dashboard that shows inventory health, recent consumption, shopping tasks, and cost splits.
- Persistent left-hand nav that lists every housemate in the active group (max 4) with their drink count + outstanding cost, plus a logout shortcut.
- Quick forms to log drinks or purchases and to manage the shopping list (disabled until a housemate logs in).
- Configurable API/WS URLs via `VITE_API_URL` and `VITE_WS_URL` (defaults use same origin + Vite proxy).

## Quick Start

### Backend (Django + DRF)

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate  # optional but recommended
pip install -r requirements.txt
python3 manage.py migrate
python3 manage.py createsuperuser  # optional admin access
python3 manage.py runserver 0.0.0.0:8000
```

> `manage.py runserver` automatically serves the ASGI app defined in `config/asgi.py`, so WebSockets work out of the box. For production deploys use `daphne -b 0.0.0.0 -p 8000 config.asgi:application` (or another ASGI server) behind a process manager/proxy.

### Frontend (Vite + React)

```bash
npm install
npm run dev
```

The dev server proxies `/api` and `/ws` to `localhost:8000`, so the dashboard connects to the backend without extra config. For production builds set:

```bash
VITE_API_URL="https://your-domain.com/api"
VITE_WS_URL="wss://your-domain.com/ws/inventory/"
npm run build
```

## API Highlights

| Endpoint | Description |
| --- | --- |
| `GET /api/insights/dashboard/` | Aggregated payload used by the dashboard + WebSocket payloads. |
| `GET /api/insights/monthly-cost/?month=YYYY-MM` | Monthly per-housemate cost breakdown. |
| `GET/POST /api/beverages/` | CRUD beverages + thresholds. `GET /low_stock/` lists items at/below reorder. |
| `GET/POST /api/consumption/` | Logs every drink; saving a log decrements inventory, snapshots price, and may spawn shopping tasks. |
| `GET/POST /api/purchases/` | Logs restocks; saving a purchase increments inventory and resolves relevant shopping entries. |
| `GET/POST/PATCH /api/shopping-list/` | Manage manual or auto-generated shopping tasks. |
| `GET/POST /api/housemates/` | Maintain the roster for attribution + cost splits (scoped per group or by `?group=`). |
| `GET /api/groups/lookup/?invite_code=ABCD` | Resolve a group by invite code so roomies can log in without knowing the numeric ID. |
| `POST /api/auth/login/` | Authenticate a housemate via their ID + access code. Returns a token used for REST + WebSocket access. |

Automations live close to the models:

- `Beverage.adjust_quantity` ensures quantities never go negative, keeps auto shopping entries in sync, and triggers websocket broadcasts via signals.
- `ConsumptionLog` and `Purchase` models atomically adjust inventory and capture price snapshots.
- `ShoppingListEntry` stores both auto-generated and manual tasks with the ability to resolve/reopen them.

## Real-Time Updates

1. The frontend keeps an open socket to `/ws/inventory/`.
2. Whenever beverages, logs, purchases, or shopping list entries change, Django signals fire `broadcast_inventory_update`, serializing the same dashboard payload that powers the REST endpoint.
3. React state hydrates from that payload so everyone sees the exact same inventory counts, cost totals, and shopping list items instantly.

You can disable live updates (e.g., in tests) by not connecting to the socket; the React hook automatically falls back to manual refreshes.

## Groups, Members, and Access Codes

1. **Create a group** – `POST /api/groups/` (or via Django admin) with a unique `name` + `invite_code`.
2. **Add housemates** – `POST /api/housemates/` with `group_id`, `name`, `color`, and a write-only `access_code` (4–6 digits works great). Each group is limited to 4 members.
3. **Distribute the invite code** – roommates open the frontend, enter the invite code, pick their name, and provide their access code to receive a short-lived token.
4. **Authenticated access** – the React app stores the token locally and sends it in the `X-Housemate-Token` header for REST requests + as `?token=` in the websocket URL. The backend automatically filters inventory, logs, shopping list, etc. to the group associated with that token.

❗ Existing data created before groups/access codes will show up under “No group selected”. Edit those records (or use a quick SQL update) to assign them to the right `HouseGroup`.

## Switching to MongoDB with Djongo (Optional)

SQLite is perfect for local dev, but if you want MongoDB:

1. Install Djongo + PyMongo (pin versions compatible with Django 5):

   ```bash
   pip install "djongo==1.3.7" "pymongo[srv]>=4.10.1"
   ```

2. Update `backend/config/settings.py`:

   ```python
   DATABASES = {
       "default": {
           "ENGINE": "djongo",
           "NAME": "brewbuddy",
           "CLIENT": {
               "host": "mongodb+srv://user:password@cluster-url/brewbuddy",
           },
       }
   }
   ```

3. Run `python3 manage.py migrate` again. Djongo maps your Django models (with signals and DRF serializers) to Mongo collections without code changes.

## Useful Commands

```bash
# Backend
cd backend
python3 manage.py test             # run Django/DRF tests
python3 manage.py loaddata seed    # (optional) load sample data you add later

# Frontend
npm run lint
npm run build

# ASGI server for production
cd backend && daphne -b 0.0.0.0 -p 8000 config.asgi:application
```

Happy brewing! ☕🍺
