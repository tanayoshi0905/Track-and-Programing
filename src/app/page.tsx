import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Shared Dev Environment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="Type here..." />
          <Button className="w-full">It works</Button>
        </CardContent>
      </Card>
    </main>
  )
}