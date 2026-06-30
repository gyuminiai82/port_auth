import { getApiDocs } from '@/lib/swagger';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

export default async function ApiDocPage() {
  const spec = await getApiDocs();
  
  return (
    <section className="container mx-auto p-4 bg-white min-h-screen">
      <SwaggerUI spec={spec} />
    </section>
  );
}
