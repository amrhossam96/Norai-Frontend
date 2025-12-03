import { ApiCodeBlock } from "./api-code-block"

interface ApiExampleProps {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  endpoint: string
  description?: string
  snippets: {
    cURL: string
    Ruby: string
    Python: string
    PHP: string
    Java: string
    "Node.js": string
    Go: string
  }
}

export function ApiExample({ method, endpoint, description, snippets }: ApiExampleProps) {
  return (
    <div className="my-8">
      {description && <p className="mb-4">{description}</p>}
      <ApiCodeBlock method={method} endpoint={endpoint} snippets={snippets} />
    </div>
  )
}

