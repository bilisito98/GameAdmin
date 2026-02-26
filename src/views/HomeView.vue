<template>
  <div class="home-wrapper">
    <!-- Banner con overlay -->
    <div class="home-banner">
      <div class="banner-overlay"></div>
      <h1 class="home-title">Bienvenido a Nuestro Mundo de Desarrollo</h1>
      <p class="home-subtitle">
        Creamos <strong>videojuegos</strong>, <strong>software</strong>, <strong>APIs web</strong>,
        <strong>páginas web</strong> e <strong>inteligencia artificial</strong>.
        Nuestra pasión es transformar ideas en experiencias digitales innovadoras.
      </p>
    </div>

    <!-- Contenido en tarjetas -->
    <div class="home-grid">
      <div class="home-card">
        <img src="https://i0.wp.com/www.marcelopedra.com.ar/blog/wp-content/uploads/2013/10/animated-gifs-of-fighting-game-backgrounds-10.gif?resize=800%2C367&ssl=1" alt="Paisajes RPG" class="home-img"/>
        <h2 class="home-card-title">Videojuegos RPG</h2>
        <p>
          Creamos experiencias inmersivas de videojuegos con mundos vivos, personajes
          interactivos y escenarios diseñados con detalle para transportarte a la aventura.
        </p>
      </div>

      <div class="home-card">
        <img src="https://cink.es/wp-content/uploads/2024/02/unity-3d-como-hacer-juegos-jpg-1.webp" alt="Unity Desarrollo" class="home-img"/>
        <h2 class="home-card-title">Creación en Unity</h2>
        <p>
          Usamos Unity 3D para desarrollar videojuegos multiplataforma, desde prototipos
          hasta juegos completos, con mecánicas únicas y diseño profesional.
        </p>
      </div>

      <div class="home-card">
        <img src="https://cdn-icons-png.flaticon.com/512/2721/2721297.png" alt="Desarrollo Software" class="home-img"/>
        <h2 class="home-card-title">Desarrollo de Software</h2>
        <p>
          Creamos soluciones a medida: desde aplicaciones de escritorio hasta sistemas web
          robustos, integrando APIs y bases de datos seguras para cada necesidad.
        </p>
      </div>

      <div class="home-card">
        <img src="https://cdn-icons-png.flaticon.com/512/1006/1006771.png" alt="Páginas Web" class="home-img"/>
        <h2 class="home-card-title">Páginas Web</h2>
        <p>
          Diseñamos páginas modernas, rápidas y responsivas con tecnologías actuales
          que aseguran la mejor experiencia para tus usuarios.
        </p>
      </div>

      <div class="home-card">
        <img src="..\assets\PacmanScratch.gif" alt="IA Scratch" class="home-img"/>
        <h2 class="home-card-title">Innovación con IA Scratch</h2>
        <p>
          Implementamos una IA visual que enseña Scratch de manera divertida, paso a paso,
          con bloques y ejemplos interactivos para niños y principiantes en programación.
        </p>
      </div>
    </div>

    <!-- Video -->
    <div class="video-container">
      <iframe
          src="https://drive.google.com/file/d/1sWdxN447Fuiem2AW6pY4taItkcNEXo3u/preview"
          width="100%" height="480" allow="autoplay">
      </iframe>
    </div>

    <!-- Logos con enlaces -->
    <div class="logos-container">
      <a href="/" target="_self">
        <img src="..\assets\LogoScratchIA.gif" alt="Scratch Logo" class="logo-img"/>
      </a>
      <a href="https://www.kodland.org/es" target="_blank">
        <img src="..\assets\LogoKodland.png" alt="Kodland Logo" class="logo-img"/>
      </a>
    </div>
  </div>
</template>

<style scoped src="../assets/HomeView.css"></style>
