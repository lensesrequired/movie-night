'use client';

import { SwaggerUIBundle } from 'swagger-ui-dist';
import 'swagger-ui-dist/swagger-ui.css';
import spec from '../public/openapi.json';

function ReactSwagger() {
  return (
    <div
      ref={(el) => {
        SwaggerUIBundle({
          spec,
          withCredentials: true,
          tryItOutEnabled: true,
          presets: [
            SwaggerUIBundle.presets.apis,
            SwaggerUIBundle.SwaggerUIStandalonePreset,
          ],
          domNode: el,
        });
      }}
    />
  );
}

export default ReactSwagger;
