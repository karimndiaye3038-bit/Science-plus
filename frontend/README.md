# CoursPlus — Frontend (React + Vite + Tailwind v4)

## Démarrage

```bash
npm install
cp .env.example .env     # puis adapter VITE_API_URL
npm run dev
```

## Structure

```
src/
├── main.jsx · App.jsx · index.css     (index.css = palette Tailwind)
├── services/api.js                    appels API + envoi de fichiers
├── context/AuthContext.jsx            connexion, rôle, session
├── hooks/useFetch.js                  chargement de données
├── utils/                             format, export Excel/PDF, rapports, vidéo
├── components/                        éléments réutilisables (ui.jsx, Modal, CourseCard...)
├── layouts/                           PublicLayout · DashboardLayout (menu latéral)
└── pages/
    ├── Home · Courses · CourseDetail · Learn · Login · Register · Profile
    ├── student/   StudentDashboard · StudentPayments
    └── admin/     AdminDashboard · AdminCourses · CourseForm
                   AdminStudents · AdminPayments · AdminReports
```

## API
Le backend fourni (`backend/`) implémente toutes les routes utilisées par ce frontend :
cours (CRUD, publication, progression, inscription), paiements, élèves, profil et envoi de fichiers (`/api/uploads`).
Les fichiers importés sont servis sur `/uploads/...`.

## Exports Excel / PDF
Ils sont générés **dans le navigateur** (exceljs + jsPDF, chargés à la demande) : aucune route backend nécessaire.
