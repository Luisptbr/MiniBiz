"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAuth } from "@/src/services/auth"
import { Building2, Mail, Lock, User, Phone, AlertCircle, CheckCircle2 } from "lucide-react"
import { AUTH_CONFIG } from "@/src/lib/constants"

interface LoginFormProps {
  onLoginSuccess?: () => void
}

export function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const router = useRouter()
  const { login, register, isAuthenticated } = useAuth()
  
  const [activeTab, setActiveTab] = useState("login")
  const [loginData, setLoginData] = useState({ 
    email: "", 
    password: "" 
  })
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState("")
  const [formSuccess, setFormSuccess] = useState("")

  // Verificar se o usuário já está autenticado
  useEffect(() => {
    if (isAuthenticated()) {
      if (onLoginSuccess) {
        onLoginSuccess()
      } else {
        router.push(AUTH_CONFIG.LOGIN_REDIRECT)
      }
    }
  }, [isAuthenticated, onLoginSuccess, router])

  // Validação do formulário de login
  const validateLoginForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!loginData.email) {
      newErrors.email = "O email é obrigatório"
    } else if (!/\S+@\S+\.\S+/.test(loginData.email)) {
      newErrors.email = "Email inválido"
    }
    
    if (!loginData.password) {
      newErrors.password = "A senha é obrigatória"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  // Validação do formulário de registro
  const validateRegisterForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!registerData.name) {
      newErrors.name = "O nome é obrigatório"
    }
    
    if (!registerData.email) {
      newErrors.email = "O email é obrigatório"
    } else if (!/\S+@\S+\.\S+/.test(registerData.email)) {
      newErrors.email = "Email inválido"
    }
    
    if (!registerData.password) {
      newErrors.password = "A senha é obrigatória"
    } else if (registerData.password.length < 6) {
      newErrors.password = "A senha deve ter pelo menos 6 caracteres"
    }
    
    if (registerData.password !== registerData.confirmPassword) {
      newErrors.confirmPassword = "As senhas não coincidem"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Limpar mensagens anteriores
    setFormError("")
    setFormSuccess("")
    
    // Validar formulário
    if (!validateLoginForm()) {
      return
    }
    
    setIsLoading(true)
    
    try {
      const response = await login(loginData.email, loginData.password)
      
      if (response.success) {
        setFormSuccess("Login realizado com sucesso!")
        
        // Redirecionar após login bem-sucedido
        if (onLoginSuccess) {
          onLoginSuccess()
        } else {
          router.push(AUTH_CONFIG.LOGIN_REDIRECT)
        }
      } else {
        setFormError(response.message || "Falha no login. Verifique suas credenciais.")
      }
    } catch (err: any) {
      setFormError(err.message || "Ocorreu um erro durante o login")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Limpar mensagens anteriores
    setFormError("")
    setFormSuccess("")
    
    // Validar formulário
    if (!validateRegisterForm()) {
      return
    }
    
    setIsLoading(true)
    
    try {
      const response = await register({
        name: registerData.name,
        email: registerData.email,
        password: registerData.password,
        phone: registerData.phone,
      })

      if (response.success) {
        setFormSuccess("Registro realizado com sucesso! Você já pode fazer login.")
        setRegisterData({ name: "", email: "", password: "", confirmPassword: "", phone: "" })
        
        // Mudar para a aba de login após registro bem-sucedido
        setTimeout(() => {
          setActiveTab("login")
        }, 2000)
      } else {
        setFormError(response.message || "Falha no registro")
      }
    } catch (err: any) {
      setFormError(err.message || "Ocorreu um erro durante o registro")
    } finally {
      setIsLoading(false)
    }
  }
  
  // Resetar erros ao mudar de campo
  const resetFieldError = (field: string) => {
    if (errors[field]) {
      setErrors({...errors, [field]: ""})
    }
  }
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Building2 className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">MiniBiz</CardTitle>
          <CardDescription>Sistema de Gestão Empresarial</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab} 
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Cadastro</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                {formSuccess && (
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertTitle>Sucesso</AlertTitle>
                    <AlertDescription>{formSuccess}</AlertDescription>
                  </Alert>
                )}
                
                {formError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Erro</AlertTitle>
                    <AlertDescription>{formError}</AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Digite seu email"
                      className={`pl-10 ${errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                      value={loginData.email}
                      onChange={(e) => {
                        setLoginData({ ...loginData, email: e.target.value })
                        resetFieldError('email')
                      }}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Digite sua senha"
                      className={`pl-10 ${errors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                      value={loginData.password}
                      onChange={(e) => {
                        setLoginData({ ...loginData, password: e.target.value })
                        resetFieldError('password')
                      }}
                    />
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-500 mt-1">{errors.password}</p>
                  )}
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                {formSuccess && (
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertTitle>Sucesso</AlertTitle>
                    <AlertDescription>{formSuccess}</AlertDescription>
                  </Alert>
                )}
                
                {formError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Erro</AlertTitle>
                    <AlertDescription>{formError}</AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Digite seu nome completo"
                      className={`pl-10 ${errors.name ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                      value={registerData.name}
                      onChange={(e) => {
                        setRegisterData({ ...registerData, name: e.target.value })
                        resetFieldError('name')
                      }}
                    />
                  </div>
                  {errors.name && (
                    <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="Digite seu email"
                      className={`pl-10 ${errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                      value={registerData.email}
                      onChange={(e) => {
                        setRegisterData({ ...registerData, email: e.target.value })
                        resetFieldError('email')
                      }}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Digite seu telefone"
                      className="pl-10"
                      value={registerData.phone}
                      onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-password">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="Crie uma senha"
                      className={`pl-10 ${errors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                      value={registerData.password}
                      onChange={(e) => {
                        setRegisterData({ ...registerData, password: e.target.value })
                        resetFieldError('password')
                      }}
                    />
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-500 mt-1">{errors.password}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmar Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Confirme sua senha"
                      className={`pl-10 ${errors.confirmPassword ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                      value={registerData.confirmPassword}
                      onChange={(e) => {
                        setRegisterData({ ...registerData, confirmPassword: e.target.value })
                        resetFieldError('confirmPassword')
                      }}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-500 mt-1">{errors.confirmPassword}</p>
                  )}
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Criando conta..." : "Criar Conta"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
