import React from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';

const SwaggerUIDoc: React.FC = () => {
    const specPath = path.join(process.cwd(), 'content/openapi.yaml');
    const specYaml = fs.readFileSync(specPath, 'utf8');
    const specObject: string | object | undefined = yaml.load(specYaml) as string | object | undefined;

    return <SwaggerUI spec={specObject} />;
};

export default SwaggerUIDoc; 