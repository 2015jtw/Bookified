import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main>
        <h1>BookiFiend</h1>
        <Button variant="outline" size="lg">
          Click me
        </Button>
      </main>
    </div>
  );
}
