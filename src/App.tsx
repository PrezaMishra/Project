import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import DailyDashboard from "./pages/DailyDashboard";
import OutletDashboard from "./pages/OutletDashboard";
import DistributionDashboard from "./pages/DistributionDashboard";
import NECCRateForm from "./pages/forms/NECCRateForm";
import DigitalPaymentsForm from "./pages/forms/DigitalPaymentsForm";
import DailyDamagesForm from "./pages/forms/DailyDamagesForm";
import DailyPurchaseForm from "./pages/forms/DailyPurchaseForm";
import OutletDataForm from "./pages/forms/OutletDataForm";
import DistributionDataForm from "./pages/forms/DistributionDataForm";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/login/:section" element={<Login />} />
            
            {/* Daily Data Entry Routes */}
            <Route path="/daily" element={<DailyDashboard />} />
            <Route path="/daily/necc-rate" element={<NECCRateForm />} />
            <Route path="/daily/digital-payments" element={<DigitalPaymentsForm />} />
            <Route path="/daily/daily-damages" element={<DailyDamagesForm />} />
            <Route path="/daily/daily-purchase" element={<DailyPurchaseForm />} />
            
            {/* Outlet Data Entry Routes */}
            <Route path="/outlet" element={<OutletDashboard />} />
            <Route path="/outlet/:outlet" element={<OutletDataForm />} />
            
            {/* Distribution Data Entry Routes */}
            <Route path="/distribution" element={<DistributionDashboard />} />
            <Route path="/distribution/:location" element={<DistributionDataForm />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
