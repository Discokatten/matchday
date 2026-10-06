# Matchday frontend

En Next.js-applikation för att se matcher i Allsvenskan och hålla konversationer kring dem. Startsidan hämtar matcher från backendens API.
Inloggning och registrering skickas via Next-route-handlers så att backendens access-token kan lagras i en HttpOnly-cookie i stället för i `localStorage`.

## Starta lokalt

Kör från den här katalogen (`frontend/`):

```bash
npm ci
npm run dev
```

Öppna `http://localhost:3000`. Frontendens server anropar backend via `API_URL`, som är standard `http://localhost:8080`.

I PowerShell:

```powershell
$env:API_URL = "http://localhost:8080"
npm run dev
```

Hela utvecklingsstacken kan i stället startas från projektroten med `docker compose up --build`.

## Förväntat auth-API-kontrakt

Backend behöver implementera följande JSON-endpoints:

| Metod  | Endpoint                | Request                                 | Förväntat svar                  |
| ------ | ----------------------- | --------------------------------------- | ------------------------------- |
| `POST` | `/api/v1/auth/register` | `{ "email": "...", "password": "..." }` | 2xx vid skapad användare        |
| `POST` | `/api/v1/auth/login`    | `{ "email": "...", "password": "..." }` | `{ "token": "<bearer-token>" }` |

Felsvar kan innehålla `{ "message": "..." }`. Frontend skickar inte
`confirmPassword` till backend. Backendens token ska vara ett Bearer-token som backend själv validerar och bör upphöra att gälla inom 24 timmar.

Vid `npm run dev` används i stället en tillfällig mock-inloggning: registrering accepterar giltiga
formulär utan att skapa en användare, och inloggning accepterar alla uppgifter som klarar
formulärvalideringen. Mock-sessionen låter dig prova skyddad navigering och UI, men backend-anrop
avvisas med `503` och mock-token skickas aldrig vidare. Mocken är avstängd utanför development
och ska inte användas för att skydda eller testa riktiga data.

Efter lyckad inloggning lagrar frontend token i en `HttpOnly`, `SameSite=Strict`-cookie. Next skyddar navigering till `/dashboard` och `/conversation/...` genom att kontrollera att cookien finns.
Skyddade API-anrop skickas via `/api/backend/...`; Next läser cookien på serversidan och vidarebefordrar token som `Authorization: Bearer ...` till motsvarande `/api/v1/...`-endpoint.
Om backend svarar med `401` tas cookien bort och klienten skickas till inloggningen. Backend måste fortfarande validera token och neka obehöriga anrop.

Route-guardens cookie-kontroll är endast navigeringsskydd, inte en säkerhetsgräns.

`API_URL` ska vara nåbar från Next-servern. Använd exempelvis `http://localhost:8080` vid lokal körning och `http://backend:8080` från frontend-containern i Docker Compose.

## Kvalitetskontroller

```bash
npm test
npm run lint
npm run build
```
