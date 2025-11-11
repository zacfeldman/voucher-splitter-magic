import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Redeem from "./pages/Redeem.tsx";
import Split from "./pages/Split.tsx";
import Check from "./pages/Check.tsx";
import Purchase from "./pages/Purchase.tsx";
import Airtime from "./pages/Airtime.tsx";
import Electricity from "./pages/Electricity.tsx";
import Betway from "./pages/Betway.tsx";
import History from "./pages/History.tsx";
import Layout from "./components/Layout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Landing page renders its own app (VoucherSplitApp) which includes its own navbar and background.
             Don't wrap it with Layout to avoid duplicate navbars. */}
          <Route path="/" element={<Index />} />
          {/* Feature pages */}
          <Route path="/redeem" element={<Layout><Redeem /></Layout>} />
          <Route path="/split" element={<Layout><Split /></Layout>} />
          <Route path="/check" element={<Layout><Check /></Layout>} />
          <Route path="/purchase" element={<Layout><Purchase /></Layout>} />
          <Route path="/airtime" element={<Layout><Airtime /></Layout>} />
          <Route path="/electricity" element={<Layout><Electricity /></Layout>} />
          <Route path="/betway" element={<Layout><Betway /></Layout>} />
          <Route path="/history" element={<Layout><History /></Layout>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<Layout><NotFound /></Layout>} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
