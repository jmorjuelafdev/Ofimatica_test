# Test institucional de Ofimática

Aplicación web diseñada para evaluar las competencias ofimáticas de candidatos en diferentes perfiles laborales. Incluye un flujo de evaluación, panel administrativo para consultar resultados y soporte PWA para funcionar sin conexión durante las pruebas.

## Tecnologías

- **HTML/CSS/JavaScript vanilla**: interfaz principal y lógica del test.
- **Service Worker + Web App Manifest**: habilita instalación como PWA y modo offline.
- **SweetAlert2 y jsPDF**: alertas amigables y exportación de resultados.
- **Datasets JSON**: banco de preguntas segmentado por perfil (`src/json/`).

## Estructura

```
Ofimatica_test/
├── index.html            # Landing, formulario y panel admin
├── styles.css            # Estilos principales
├── quiz.js               # Lógica del cuestionario y panel
├── manifest.webmanifest  # Configuración PWA
├── sw.js                 # Service Worker (cache básico)
├── src/
│   ├── img/              # Recursos gráficos e íconos PWA
│   └── json/             # Preguntas por perfil
└── README.md
```

## Ejecución local

1. Instala dependencias (solo se usa `npx serve`, por lo que basta con tener Node.js >= 16).
2. En la raíz del proyecto ejecuta:
   ```bash
   npx serve
   ```
3. Abre la URL que indique la terminal (ej. `http://localhost:3000` o el puerto asignado).

## Instalación como PWA

1. Con el servidor corriendo, abre la URL en Chrome/Edge.
2. Espera a que cargue el `manifest.webmanifest` y el `sw.js`.
3. En el navegador, usa el menú → **Aplicaciones** → *Instalar este sitio como una aplicación* (o el ícono de instalación en la barra de direcciones).
4. Una vez instalada, abre la app standalone y recorre las pantallas necesarias para que el Service Worker cachee los recursos.
5. Después de eso, podrás desconectar el equipo de internet y continuar usando la app offline.

## Flujos principales

### Evaluación
1. Registrar nombre, documento y perfil.
2. Cargar el test (25 preguntas por perfil, 50 minutos).
3. Navegar entre preguntas, revisar mapa y panel resumen.
4. Finalizar para ver el resultado, interpretación y exportaciones.

### Panel administrativo
1. Ingresar con la clave definida en `quiz.js` (`ADMIN_PASSWORD`).
2. Filtrar por documento, perfil o fecha.
3. Exportar resultados a Excel/PDF y revisar el detalle por candidato.

## Despliegue en GitHub Pages

1. Haz `git push` al repositorio.
2. En **Settings → Pages**, selecciona la rama y carpeta (`/`).
3. Accede a `https://<usuario>.github.io/<repo>` y repite los pasos de instalación PWA si deseas la app instalada desde la web pública.

## Consideraciones

- Los datasets en `src/json/` pueden editarse para actualizar preguntas o multimedia.
- El Service Worker usa cache-first simple; si cambias recursos, refresca con *Empty Cache and Hard Reload* para forzar la actualización.
- Mantén los íconos (`src/img/icon-192.png`, `icon-512.png`) y `favicon.ico` sincronizados para que la identidad visual sea consistente.
