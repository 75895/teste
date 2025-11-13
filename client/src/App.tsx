import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Tables from "./pages/Tables";
import POS from "./pages/POS";
import Products from "./pages/Products";
import Reports from "./pages/Reports";
import TechnicalSheet from "./pages/TechnicalSheet";
import Warehouse from "./pages/Warehouse";
import HouseMadeProducts from "./pages/HouseMadeProducts";
import Ingredients from "./pages/Ingredients";
import Requisitions from "./pages/Requisitions";

function Router() {// make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"\\"} component={Home} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/tables"} component={Tables} />
      <Route path={"/pos"} component={POS} />
      <Route path={"/products"} component={Products} />
      <Route path={"/reports"} component={Reports} />
      <Route path={"/technical-sheet"} component={TechnicalSheet} />
      <Route path={"/warehouse"} component={Warehouse} />
      <Route path={"/house-made-products"} component={HouseMadeProducts} />
      <Route path={"/ingredients"} component={Ingredients} />
      <Route path={"/requisitions"} component={Requisitions} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
