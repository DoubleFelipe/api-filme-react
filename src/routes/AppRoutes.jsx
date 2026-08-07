import { lazy, Suspense, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { Loading } from "../components/Loading/Loading.jsx";

const Home = lazy(() => import("../pages/Home/Home.jsx"));
const MovieDetails = lazy(() => import("../pages/MovieDetails/MovieDetails.jsx"));
const Favorites = lazy(() => import("../pages/Favorites/Favorites.jsx"));
const NotFound = lazy(() => import("../pages/NotFound/NotFound.jsx"));
const Login = lazy(() => import("../pages/Login/Login.jsx"));

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  return null;
}

export function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<Loading count={10} />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/favoritos" element={<Favorites />} />
          <Route path="/login" element={<Login />} />
          <Route path="/movie/:id" element={<MovieDetails />} />
          <Route path="/:id" element={<MovieDetails />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
}
