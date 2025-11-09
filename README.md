🍺 Brew Buddy

Brew Buddy is a little app that helps housemates keep track of drinks, restocks, and costs. Everyone logs what they drink, inventory updates for all, and costs get split automatically each month.
Basically, no more “who finished the last beer” arguments.

```
brewbuddy-app/
├── backend/   -> Django + DRF + Channels (SQLite for now)
└── src/       -> React (Vite) frontend with live updates
```

Backend:
Handles inventory, purchases, drink logs, and who owes what.
Also pushes real-time updates through WebSockets (/ws/inventory/).

Frontend:
Has a dashboard showing what’s in stock, what’s low, who drank what, and costs.
There’s a left sidebar with roommates + their drink count and what they owe.
