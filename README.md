# Personal Portfolio

A highly interactive, security-focused, and gamified personal portfolio website built with modern web technologies. This project showcases advanced frontend development skills, including 3D graphics, complex animations, and a custom-built admin dashboard.

## 🚀 About The Project

This portfolio is more than just a static display of work; it's an immersive experience. It features a terminal-style interface, a "Threat Map" for visualizing visitor traffic (simulated or real), hidden easter eggs, and a fully functional blog system. The site is designed to be responsive, accessible, and secure, with integrated protection mechanisms like Cloudflare Turnstile.

## ✨ Key Features

*   **Interactive UI/UX**:
    *   **3D Elements**: Integrated Three.js scenes for visual depth.
    *   **Particle Effects**: Dynamic background particles and cursor trails.
    *   **Terminal Interface**: A functional terminal for command-line style navigation.
    *   **Hacker Mode**: A toggleable visual theme for a "cybersecurity" aesthetic.
*   **Admin Dashboard**:
    *   A comprehensive CMS to manage Blogs, Projects, Certificates, and Testimonials.
    *   Real-time analytics and logs.
    *   Secure authentication via Supabase.
*   **Security Features**:
    *   **Threat Map**: Visual representation of security events/traffic.
    *   **Security Check**: Integrated Cloudflare Turnstile for bot protection.
    *   **Protected Routes**: Role-based access control for admin areas.
*   **Gamification**:
    *   **Easter Eggs**: Hidden secrets scattered throughout the site.
    *   **Footer Game**: A playable mini-game embedded in the footer.
*   **Content Management**:
    *   **Blog System**: Markdown-based blogging with tag support.
    *   **Project Showcase**: Detailed project views with filtering.

## 🛠️ Built With

*   **Frontend**: [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Shadcn UI](https://ui.shadcn.com/)
*   **Backend/Auth**: [Supabase](https://supabase.com/)
*   **Animations**: [Framer Motion](https://www.framer.com/motion/)
*   **3D Graphics**: [Three.js](https://threejs.org/) / [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
*   **Icons**: [Lucide React](https://lucide.dev/)

## 🏁 Getting Started

Follow these instructions to set up the project locally.

### Prerequisites

*   Node.js (v18 or higher)
*   npm or yarn

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/personal-portfolio.git
    cd personal-portfolio
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory and add your Supabase credentials:

    ```env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Run the development server**
    ```bash
    npm run dev
    ```

## 📂 Project Structure

```
src/
├── components/     # Reusable UI components
├── contexts/       # React Context providers (Auth, Theme, etc.)
├── hooks/          # Custom React hooks
├── layouts/        # Page layouts (Admin, Main)
├── pages/          # Application pages (Home, Blog, Admin, etc.)
├── services/       # API services and helpers
├── utils/          # Utility functions
└── App.tsx         # Main application entry point
```

## 📜 Scripts

*   `npm run dev`: Starts the development server.
*   `npm run build`: Builds the app for production.
*   `npm run lint`: Runs ESLint to check for code quality issues.
*   `npm run preview`: Previews the production build locally.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
