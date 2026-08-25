import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <h2 className="text-2xl font-semibold">页面未找到</h2>
        <p className="text-muted-foreground max-w-md">
          抱歉，您访问的页面不存在或已被移动。请返回工作台继续学习。
        </p>
        <Link to="/">
          <Button>
            <Home className="h-4 w-4 mr-2" />
            返回工作台
          </Button>
        </Link>
      </div>
    </div>
  );
}
