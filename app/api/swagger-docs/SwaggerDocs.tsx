'use client';

import SwaggerUI from 'swagger-ui-react';

type ReactSwaggerProps = {
  spec: Record<string, any>,
};

const ReactSwagger: React.FC<ReactSwaggerProps> = props => {
  return <SwaggerUI spec={props.spec} />;
}

export default ReactSwagger;
