import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import RoomsPage from "@/pages/RoomsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/quartos" replace />} />
          <Route element={<AppLayout />}>
            <Route path="/quartos" element={<RoomsPage />} />
            <Route path="/hospedes" element={<div className="p-6 text-muted-foreground">Módulo de Hóspedes — em breve</div>} />
            <Route path="/reservas" element={<div className="p-6 text-muted-foreground">Módulo de Reservas — em breve</div>} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
