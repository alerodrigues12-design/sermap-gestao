import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Lock, User, Eye, EyeOff, AlertCircle } from "lucide-react";

const LOGO_URL = "https://manus-storage.oss-cn-beijing.aliyuncs.com/user-file-storage/c4f0e3b1c7b54e3eab47d7f3b4e4d1a8/LogotipoSemFundo2.png";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao fazer login.");
        return;
      }

      // Reload the page to trigger auth state refresh
      window.location.href = "/";
    } catch (err) {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f5f0eb] via-[#ede8e2] to-[#e8e0d8] p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234a5a3a' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />
      
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/90 backdrop-blur-sm relative z-10">
        <CardHeader className="text-center pb-2 pt-8">
          <div className="flex justify-center mb-6">
            <img
              src={LOGO_URL}
              alt="Alessandra Hoffmann Consultoria Estratégica"
              className="h-16 object-contain"
            />
          </div>
          <div className="w-16 h-0.5 bg-[#4a5a3a] mx-auto mb-4" />
          <h1 className="text-xl font-serif font-semibold text-[#2d3a22]">
            SERMAP Engenharia
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestão Estratégica de Passivo
          </p>
        </CardHeader>

        <CardContent className="pt-4 pb-8 px-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                Usuário
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Digite seu usuário"
                  className="pl-10 h-11 bg-gray-50/50 border-gray-200 focus:border-[#4a5a3a] focus:ring-[#4a5a3a]/20"
                  required
                  autoComplete="username"
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  className="pl-10 pr-10 h-11 bg-gray-50/50 border-gray-200 focus:border-[#4a5a3a] focus:ring-[#4a5a3a]/20"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-[#4a5a3a] hover:bg-[#3d4d2f] text-white font-medium shadow-md hover:shadow-lg transition-all"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Entrando...
                </div>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-100 text-center">
            <p className="text-xs text-muted-foreground">
              Plataforma de acompanhamento exclusiva
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Alessandra Hoffmann — Consultoria Estratégica
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
