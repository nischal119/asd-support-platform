"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { Settings, Type, Eye, Volume2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Navbar } from "@/components/layout/navbar"

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    highContrast: false,
    reducedMotion: false,
    fontSize: [16],
    colorScheme: "default",
    soundEnabled: true,
    screenReaderOptimized: false,
  })
  const { toast } = useToast()

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleSaveSettings = () => {
    // Save settings to localStorage
    localStorage.setItem("accessibility_settings", JSON.stringify(settings))

    // Apply settings to document
    applySettings()

    toast({
      title: "Settings Saved",
      description: "Your accessibility preferences have been saved.",
    })
  }

  const applySettings = () => {
    const root = document.documentElement

    // Apply font size
    root.style.fontSize = `${settings.fontSize[0]}px`

    // Apply high contrast
    if (settings.highContrast) {
      root.classList.add("high-contrast")
    } else {
      root.classList.remove("high-contrast")
    }

    // Apply reduced motion
    if (settings.reducedMotion) {
      root.classList.add("reduce-motion")
    } else {
      root.classList.remove("reduce-motion")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Accessibility Settings</h1>
            <p className="text-gray-600">Customize your experience for better accessibility and comfort</p>
          </div>

          <div className="space-y-6">
            {/* Visual Settings */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Eye className="h-5 w-5 text-blue-600" />
                  <CardTitle>Visual Settings</CardTitle>
                </div>
                <CardDescription>Adjust visual elements for better readability and comfort</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="high-contrast">High Contrast Mode</Label>
                    <p className="text-sm text-muted-foreground">Increase contrast for better visibility</p>
                  </div>
                  <Switch
                    id="high-contrast"
                    checked={settings.highContrast}
                    onCheckedChange={(checked) => handleSettingChange("highContrast", checked)}
                  />
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label>Font Size</Label>
                  <div className="px-3">
                    <Slider
                      value={settings.fontSize}
                      onValueChange={(value) => handleSettingChange("fontSize", value)}
                      max={24}
                      min={12}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Small (12px)</span>
                      <span>Current: {settings.fontSize[0]}px</span>
                      <span>Large (24px)</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label htmlFor="color-scheme">Color Scheme</Label>
                  <Select
                    value={settings.colorScheme}
                    onValueChange={(value) => handleSettingChange("colorScheme", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default (Calming Blues & Greens)</SelectItem>
                      <SelectItem value="warm">Warm (Soft Oranges & Yellows)</SelectItem>
                      <SelectItem value="cool">Cool (Blues & Purples)</SelectItem>
                      <SelectItem value="monochrome">Monochrome (Grayscale)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Motion Settings */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-green-600" />
                  <CardTitle>Motion & Animation</CardTitle>
                </div>
                <CardDescription>Control animations and motion effects</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="reduced-motion">Reduce Motion</Label>
                    <p className="text-sm text-muted-foreground">Minimize animations and transitions</p>
                  </div>
                  <Switch
                    id="reduced-motion"
                    checked={settings.reducedMotion}
                    onCheckedChange={(checked) => handleSettingChange("reducedMotion", checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Audio Settings */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Volume2 className="h-5 w-5 text-purple-600" />
                  <CardTitle>Audio Settings</CardTitle>
                </div>
                <CardDescription>Configure audio feedback and notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="sound-enabled">Sound Notifications</Label>
                    <p className="text-sm text-muted-foreground">Enable audio feedback for actions</p>
                  </div>
                  <Switch
                    id="sound-enabled"
                    checked={settings.soundEnabled}
                    onCheckedChange={(checked) => handleSettingChange("soundEnabled", checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Screen Reader Settings */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Type className="h-5 w-5 text-orange-600" />
                  <CardTitle>Screen Reader Support</CardTitle>
                </div>
                <CardDescription>Optimize the interface for screen readers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="screen-reader">Screen Reader Optimized</Label>
                    <p className="text-sm text-muted-foreground">Enhanced descriptions and navigation</p>
                  </div>
                  <Switch
                    id="screen-reader"
                    checked={settings.screenReaderOptimized}
                    onCheckedChange={(checked) => handleSettingChange("screenReaderOptimized", checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end pt-4">
              <Button onClick={handleSaveSettings} size="lg">
                Save Settings
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
