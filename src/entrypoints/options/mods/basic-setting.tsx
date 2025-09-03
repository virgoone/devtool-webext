import {
  Brain,
  ChevronDown,
  Copy,
  ExternalLink,
  Eye,
  EyeClosed,
  HelpCircle,
  Info,
  Keyboard,
  LayoutGrid,
  LogOut,
  Mail,
  MessageSquare,
  QrCode,
  RefreshCw,
  Settings,
  Sparkles,
  ImportIcon as Translate,
  Zap
} from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import "@/locales"
import { z } from "zod"

import Logo from "@/assets/icon.png"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ServiceProvider } from "@/constants"
import { useAppConfig, type Language, type Theme } from "@/store/config"
import { zodResolver } from "@hookform/resolvers/zod"

const formSchema = z
  .object({
    theme: z.string().min(2, {
      message: "Theme is required"
    }),
    language: z.string({
      message: "Language is required"
    }),
    providerName: z.string().min(2, {
      message: "Provider Name is required"
    }),
    apiKey: z.string().min(2, {
      message: "API Key is required"
    }),
    customSite: z.boolean(),
    customSiteUrl: z
      .string({
        message: "Custom Site URL is required"
      })
      .optional()
      .nullable(),
    customModel: z.boolean(),
    customModelName: z
      .string({
        message: "Custom Model Name is required"
      })
      .optional()
      .nullable()
  })
  .superRefine((val, ctx) => {
    if (val.customSite && !val.customSiteUrl) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Custom Site URL is required",
        path: ["customSiteUrl"]
      })
    }
    if (val.customModel && !val.customModelName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Custom Site URL is required",
        path: ["customSiteUrl"]
      })
    }
  })

export default function BasicSetting() {
  const { t } = useTranslation()
  const config = useAppConfig()

  const [apiKeyInputType, setApiKeyInputType] = useState<"password" | "text">(
    "text"
  )
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      theme: config.theme,
      language: config.language,
      providerName: config.modelConfig.providerName,
      apiKey: config.modelConfig.apiKey,
      customSite: false,
      customSiteUrl: "",
      customModel: false,
      customModelName: ""
    }
  })
  console.log("config", form.formState?.errors)

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values)
    if (values.theme) {
      config.setTheme(values.theme as Theme)
    }
    if (values.language) {
      i18n.changeLanguage(values.language)
      config.setLanguage(values.language as Language)
    }
  }

  return (
    <main className="flex-1 p-8">
      <Form {...form}>
        <form className="space-y-4 w-[700px]">
          <div className="max-w-3xl">
            <h1 className="text-2xl font-semibold mb-8">{t("options.basic.title")}</h1>

            {/* Appearance Section */}
            <section className="mb-8">
              <h2 className="text-lg font-medium mb-4">
                {t("options.basic.appearance.title")}
              </h2>
              <Card className="p-6 py-4 rounded-xl shadow-sm">
                <CardContent className="p-0 space-y-2">
                  <FormField
                    control={form.control}
                    name="theme"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("options.basic.appearance.theme")}</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={t("options.basic.appearance.placeholder")}
                              />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="auto">
                                {t("options.basic.appearance.options.auto")}
                              </SelectItem>
                              <SelectItem value="light">
                                {t("options.basic.appearance.options.light")}
                              </SelectItem>
                              <SelectItem value="dark">
                                {t("options.basic.appearance.options.dark")}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="language"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("options.basic.language.title")}</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={t("options.basic.language.placeholder")}
                              />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="zh">
                                {t("options.basic.language.options.zh")}
                              </SelectItem>
                              <SelectItem value="en">
                                {t("options.basic.language.options.en")}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex flex-row items-center justify-between rounded-lg border p-4 !mt-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <QrCode className="w-4 h-4 text-gray-600" />
                        <label className="text-base font-medium">{t("linkQRInjectorTitle")}</label>
                      </div>
                      <p className="text-sm text-gray-500">
                        {t("linkQRInjectorDescription")}
                      </p>
                    </div>
                    <Switch
                      checked={config.enableLinkQRIcons}
                      onCheckedChange={config.setEnableLinkQRIcons}
                    />
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Preview Section */}
            {/* <section className="mb-8">
              <Card className="p-8 bg-gray-50">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center">
                      <Brain className="w-3 h-3 text-purple-600" />
                    </div>
                    <span className="font-medium">Sider Fusion</span>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Sider enhances browsing with AI, streamlining tasks and
                    boosting productivity. An essential tool for efficient
                    online navigation!
                  </p>
                </div>
              </Card>
            </section> */}

            {/* Font Size Section */}
            {/* <section className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium">消息字体大小</h2>
                <Select defaultValue="auto">
                  <SelectTrigger className="w-24">
                    <SelectValue placeholder="选择大小" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">自动</SelectItem>
                    <SelectItem value="small">小</SelectItem>
                    <SelectItem value="medium">中</SelectItem>
                    <SelectItem value="large">大</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-sm text-gray-500">根据窗口尺寸自动调整</p>
            </section> */}

            {/* Side Panel Section */}
            <section className="flex flex-row items-center justify-between rounded-lg border p-4 mb-8 shadow-sm">
              <div className="space-y-0.5">
                <h2 className="font-semibold text-base">侧边栏位置</h2>
                <p className="text-sm text-muted-foreground">
                  对于Chrome 114或更高版本，只能在浏览器设置中更改
                </p>
              </div>
              <Button variant="ghost" size="icon">
                <ExternalLink className="w-4 h-4" />
              </Button>
            </section>

            {/* AI Access Section */}
            <section className="mb-8">
              <h2 className="text-lg font-medium mb-4">
                {t("options.basic.ai.title")}
              </h2>
              <Card className="p-6 py-4 rounded-xl shadow-sm">
                <CardContent className="p-0 space-y-2">
                  <FormField
                    control={form.control}
                    name="providerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("options.basic.ai.provider.title")}</FormLabel>
                        <FormControl>
                          <Select
                            defaultValue={field.value}
                            onValueChange={field.onChange}>
                            <SelectTrigger className="w-full">
                              <SelectValue
                                placeholder={t("options.basic.ai.provider.placeholder")}
                              />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={ServiceProvider.OpenAI}>
                                {t("options.basic.ai.provider.options.openai")}
                              </SelectItem>
                              <SelectItem value={ServiceProvider.XAI}>
                                {t("options.basic.ai.provider.options.xai")}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid gap-2">
                    <FormField
                      control={form.control}
                      name="apiKey"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("options.basic.ai.apikey.title")}</FormLabel>
                          <FormDescription>
                            {t("options.basic.ai.apikey.description")}
                          </FormDescription>
                          <FormControl>
                            <div className="relative">
                              <Input
                                placeholder={t("options.basic.ai.apikey.placeholder")}
                                type={apiKeyInputType}
                                value={field.value}
                                onChange={field.onChange}
                              />
                              <Button
                                variant="ghost"
                                type="button"
                                size="icon"
                                onClick={() =>
                                  setApiKeyInputType(
                                    apiKeyInputType === "password"
                                      ? "text"
                                      : "password"
                                  )
                                }
                                className="absolute right-0 top-1/2 -translate-y-1/2">
                                {apiKeyInputType === "text" ? (
                                  <EyeClosed className="w-4 h-4" />
                                ) : (
                                  <Eye className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">
                      {t("options.basic.ai.model.title")}
                    </label>
                    <Select defaultValue="grok">
                      <SelectTrigger className="w-60">
                        <SelectValue
                          placeholder={t("options.basic.ai.model.placeholder")}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="grok">grok-2-vision-1212</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      aria-label={t("options.basic.ai.model.refreshBtn")}>
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-4 !mt-8">
                    <FormField
                      control={form.control}
                      name="customSite"
                      render={({ field }) => (
                        <FormItem className="flex flex-row justify-between items-center">
                          <FormLabel className="text-gray-500 text-sm">
                            {t("options.basic.ai.customWebsite.title")}
                          </FormLabel>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {form.watch("customSite") && (
                      <FormField
                        control={form.control}
                        name="customSiteUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                placeholder={t("options.basic.ai.customWebsite.placeholder")}
                                value={field.value || ''}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                name={field.name}
                                ref={field.ref}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name="customModel"
                      render={({ field }) => (
                        <FormItem className="flex flex-row justify-between items-center">
                          <FormLabel className="text-gray-500 text-sm">
                            {t("options.basic.ai.customModel.title")}
                          </FormLabel>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {form.watch("customModel") && (
                      <FormField
                        control={form.control}
                        name="customModelName"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                placeholder={t("options.basic.ai.customModel.placeholder")}
                                value={field.value || ''}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                name={field.name}
                                ref={field.ref}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            </section>
            <div className="flex mt-5 space-x-2">
              <Button
                className="flex-1"
                key="back"
                type="reset"
                variant="outline">
                {t("options.basic.form.reset")}
              </Button>
              <Button
                className="flex-1"
                key="submit"
                type="button"
                onClick={() => form.handleSubmit(onSubmit)()}>
                {t("options.basic.form.save")}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </main>
  )
}
