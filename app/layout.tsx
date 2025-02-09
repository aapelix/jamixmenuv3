"use client";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { use, useEffect, useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DropdownMenuLabel, DropdownMenuSeparator } from "@radix-ui/react-dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [theme, setTheme] = useState("theme-red-dark");
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setTheme(savedTheme);
    }

    const savedDarkMode = localStorage.getItem("darkMode");
    if (savedDarkMode) {
      setIsDark(savedDarkMode == "true" ? true : false);
    }

    console.log("Theme:", savedTheme);
    console.log("Dark mode:", savedDarkMode);
  }, []);

  const handleThemeChange = (newTheme: string) => {
    const cleanTheme = newTheme.replace('-dark', '');
    
    const themeToSet = isDark ? `${cleanTheme}-dark` : cleanTheme;
    
    setTheme(themeToSet);
    localStorage.setItem("theme", themeToSet);
    localStorage.setItem("darkMode", isDark.toString());
  };

  const handleDarkMode = () => {
    const currentCleanTheme = theme.replace('-dark', '');
    const newTheme = isDark ? currentCleanTheme : `${currentCleanTheme}-dark`;
    
    setIsDark(!isDark);
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    localStorage.setItem("darkMode", (!isDark).toString());
  };

  return (
    <html lang="en" className={theme}>
      <body className={inter.className}>
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="absolute top-4 right-4">
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button>Valitse teema</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent style={{ padding: "0.5rem", marginRight: "0.5rem" }}>
                <div className="flex items-center gap-2">
                  <Switch id="dark-theme" checked={isDark} onCheckedChange={() => {
                    setIsDark(!isDark);
                    handleDarkMode()
                  }} />
                  <Label htmlFor="dark-theme">Tumma teema?</Label>
                </div>
                <DropdownMenuSeparator  />
                {[
                  { theme: "zinc", name: "Harmaa" },
                  { theme: "red", name: "Punainen" },
                  { theme: "green", name: "Vihreä" },
                  { theme: "orange", name: "Oranssi" },
                  { theme: "rose", name: "Pinkki" },
                  { theme: "purple", name: "Violetti" },
                  { theme: "blue", name: "Sininen" },
                ].map(({ theme, name }) => (
                  <DropdownMenuItem key={theme} onClick={() => handleThemeChange("theme-" + theme + (isDark ? "-dark" : ""))}>
                  <div className={`w-4 h-4 theme-${theme}-dark bg-primary rounded-full`} />
                  {name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            </div>

            {children}
          </ThemeProvider>
      </body>
    </html>
  );
}
