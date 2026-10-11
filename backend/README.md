# CoursPlus — Backend (Express 5 + MongoDB)

```bash
npm install
cp .env.example .env     # adapter MONGO_URI, JWT_SECRET, ADMIN_PASSWORD
npm run dev
```

Au premier démarrage, un compte professeur est créé (`ADMIN_EMAIL` / `ADMIN_PASSWORD`).

## Routes
| Méthode | Route | Accès |
|---|---|---|
| POST | /api/auth/register · /api/auth/login | public |
| PUT | /api/auth/me | connecté |
| GET | /api/courses · /api/courses/:id | public (contenu complet seulement si inscrit ou admin) |
| GET | /api/courses/mine | élève |
| POST | /api/courses/:id/enroll · /api/courses/:id/progress | élève |
| POST · PUT · DELETE | /api/courses · /api/courses/:id | admin |
| POST | /api/payments | élève |
| GET | /api/payments/me | élève |
| GET · PATCH | /api/payments · /api/payments/:id | admin (valider/refuser) |
| GET | /api/students | admin |
| POST | /api/uploads | admin (champ `file`, 500 Mo max) |

Un paiement validé par l'admin inscrit automatiquement l'élève au cours.
