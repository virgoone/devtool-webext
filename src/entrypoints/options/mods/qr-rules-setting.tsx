import { i18n } from "#i18n"
import {
  Check,
  Download,
  Edit2,
  FileText,
  Plus,
  Settings,
  Trash2,
  Upload,
  X
} from "lucide-react"
import { useRef, useState } from "react"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import "@/locales"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { QRParameter, QRRule, QRRuleType, useAppConfig } from "@/store/config"

export default function QRRulesSetting() {
  const { t } = useTranslation()
  const config = useAppConfig()

  const [editingRule, setEditingRule] = useState<QRRule | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingParameters, setEditingParameters] = useState<QRParameter[]>([])
  const [ruleName, setRuleName] = useState("")
  const [ruleDescription, setRuleDescription] = useState("")
  const [ruleEnabled, setRuleEnabled] = useState(true)
  const [domainPattern, setDomainPattern] = useState("*")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 创建新规则
  const createNewRule = (): QRRule => ({
    id: `rule_${Date.now()}`,
    name: "",
    parameters: [],
    enabled: true,
    description: ""
  })

  // 创建新参数
  const createNewParameter = (): QRParameter => ({
    id: `param_${Date.now()}`,
    key: "",
    type: QRRuleType.Fixed,
    value: "",
    defaultValue: ""
  })

  // 打开添加规则对话框
  const openAddDialog = () => {
    setEditingRule(null)
    setEditingParameters([])
    setRuleName("")
    setRuleDescription("")
    setRuleEnabled(true)
    setDomainPattern("*")
    setIsDialogOpen(true)
  }

  // 打开编辑规则对话框
  const openEditDialog = (rule: QRRule) => {
    setEditingRule(rule)
    setEditingParameters([...rule.parameters])
    setRuleName(rule.name)
    setRuleDescription(rule.description || "")
    setRuleEnabled(rule.enabled)
    setDomainPattern(rule.domainPattern || "*")
    setIsDialogOpen(true)
  }

  // 关闭对话框
  const closeDialog = () => {
    setIsDialogOpen(false)
    setEditingRule(null)
    setEditingParameters([])
    setRuleName("")
    setRuleDescription("")
    setRuleEnabled(true)
    setDomainPattern("*")
  }

  // 添加参数
  const addParameter = () => {
    setEditingParameters([...editingParameters, createNewParameter()])
  }

  // 更新参数
  const updateParameter = (paramId: string, updates: Partial<QRParameter>) => {
    setEditingParameters(
      editingParameters.map((param) =>
        param.id === paramId ? { ...param, ...updates } : param
      )
    )
  }

  // 删除参数
  const deleteParameter = (paramId: string) => {
    setEditingParameters(
      editingParameters.filter((param) => param.id !== paramId)
    )
  }

  // 保存规则
  const saveRule = () => {
    // 验证规则名称
    if (!ruleName.trim()) {
      toast.error(t("options.qrRules.messages.validationError"))
      return
    }

    // 验证参数
    for (const param of editingParameters) {
      if (!param.key.trim()) {
        toast.error(t("options.qrRules.messages.paramValidationError"))
        return
      }
      if (param.type === QRRuleType.Fixed && !param.value?.trim()) {
        toast.error(t("options.qrRules.messages.fixedValueRequired"))
        return
      }
    }

    const ruleData: QRRule = {
      id: editingRule?.id || `rule_${Date.now()}`,
      name: ruleName.trim(),
      parameters: editingParameters,
      enabled: ruleEnabled,
      description: ruleDescription.trim() || undefined,
      domainPattern: domainPattern.trim() || "*"
    }

    if (editingRule) {
      // 更新现有规则
      config.updateQRRule(editingRule.id, ruleData)
      toast.success(t("options.qrRules.messages.updateSuccess"))
    } else {
      // 添加新规则
      config.addQRRule(ruleData)
      toast.success(t("options.qrRules.messages.addSuccess"))
    }

    closeDialog()
  }

  // 删除规则
  const deleteRule = (ruleId: string) => {
    config.deleteQRRule(ruleId)
    toast.success(t("options.qrRules.messages.deleteSuccess"))
  }

  // 导入规则
  const handleImport = () => {
    fileInputRef.current?.click()
  }

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string)
        config.importQRRules(jsonData)
        toast.success(t("options.qrRules.messages.importSuccess"))
      } catch (error) {
        toast.error(t("options.qrRules.messages.importError"))
      }
    }
    reader.readAsText(file)

    // 清空文件输入
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // 导出规则
  const handleExport = () => {
    const dataStr = JSON.stringify(config.qrRulesConfig.rules, null, 2)
    const blob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.href = url
    link.download = "qr-rules.json"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast.success(t("options.qrRules.messages.exportSuccess"))
  }

  return (
    <main className="flex-1 p-8">
      <div className="space-y-4 w-[700px]">
        <div className="max-w-3xl">
          <h1 className="text-2xl font-semibold mb-8">
            {t("options.qrRules.title")}
          </h1>

          {/* Global Switch Section */}
          <section className="mb-8">
            <Card className="p-6 py-4 rounded-xl shadow-sm">
              <CardContent className="p-0">
                <div className="flex flex-row items-center justify-between rounded-lg">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Settings className="w-4 h-4 text-gray-600" />
                      <label className="text-base font-medium">
                        {t("options.qrRules.globalSwitch.title")}
                      </label>
                    </div>
                    <p className="text-sm text-gray-500">
                      {t("options.qrRules.globalSwitch.description")}
                    </p>
                  </div>
                  <Switch
                    checked={config.qrRulesConfig.globalEnabled}
                    onCheckedChange={(checked) =>
                      config.setQRRulesConfig({
                        ...config.qrRulesConfig,
                        globalEnabled: checked
                      })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Rules Management Section */}
          <section className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">
                {t("options.qrRules.rulesList.title")}
              </h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleImport}>
                  <Upload className="w-4 h-4 mr-2" />
                  {t("options.qrRules.buttons.import")}
                </Button>
                <Button variant="outline" size="sm" onClick={handleExport}>
                  <Download className="w-4 h-4 mr-2" />
                  {t("options.qrRules.buttons.export")}
                </Button>
                <Button onClick={openAddDialog} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  {t("options.qrRules.buttons.add")}
                </Button>
              </div>
            </div>

            {/* 规则列表 */}
            <Card className="p-6 py-4 rounded-xl shadow-sm">
              <CardContent className="p-0 space-y-3">
                {config.qrRulesConfig.rules.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>{t("options.qrRules.rulesList.empty")}</p>
                  </div>
                ) : (
                  config.qrRulesConfig.rules.map((rule) => (
                    <Card key={rule.id} className="border border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium text-gray-900">
                                {rule.name}
                              </h4>
                              <Switch
                                checked={rule.enabled}
                                onCheckedChange={(checked) =>
                                  config.updateQRRule(rule.id, {
                                    enabled: checked
                                  })
                                }
                              />
                            </div>
                            {rule.description && (
                              <p className="text-sm text-gray-600 mb-2">
                                {rule.description}
                              </p>
                            )}
                            
                            {/* 域名匹配 */}
                            <div className="mb-3">
                              <span className="text-xs text-gray-500">
                                域名匹配: <span className="font-mono text-blue-600">{rule.domainPattern || "*"}</span>
                              </span>
                            </div>

                            {/* 参数列表 */}
                            <div className="space-y-2">
                              {rule.parameters.map((param) => (
                                <div
                                  key={param.id}
                                  className="flex items-center gap-2 text-sm bg-gray-50 p-2 rounded">
                                  <span className="font-mono text-blue-600">
                                    {param.key}
                                  </span>
                                  <span className="text-gray-400">=</span>
                                  {param.type === QRRuleType.Fixed ? (
                                    <span className="font-mono text-green-600">
                                      {param.value}
                                    </span>
                                  ) : (
                                    <span className="text-orange-600">
                                      [输入]{" "}
                                      {param.defaultValue &&
                                        `(默认: ${param.defaultValue})`}
                                    </span>
                                  )}
                                  <span
                                    className={`px-1.5 py-0.5 rounded text-xs ${
                                      param.type === QRRuleType.Fixed
                                        ? "bg-green-100 text-green-700"
                                        : "bg-orange-100 text-orange-700"
                                    }`}>
                                    {param.type === QRRuleType.Fixed
                                      ? "固定"
                                      : "输入"}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-1 ml-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(rule)}>
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteRule(rule.id)}
                              className="text-red-500 hover:text-red-700">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </CardContent>
            </Card>
          </section>
        </div>

        {/* 隐藏文件输入 */}
        <input
          type="file"
          ref={fileInputRef}
          accept=".json"
          className="hidden"
          onChange={handleFileImport}
        />

        {/* 编辑规则对话框 */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingRule
                  ? t("options.qrRules.dialog.editTitle")
                  : t("options.qrRules.dialog.addTitle")}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* 基本信息 */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ruleName">
                    {t("options.qrRules.dialog.ruleName")}
                  </Label>
                  <Input
                    id="ruleName"
                    value={ruleName}
                    onChange={(e) => setRuleName(e.target.value)}
                    placeholder={t(
                      "options.qrRules.dialog.ruleNamePlaceholder"
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ruleDescription">
                    {t("options.qrRules.dialog.ruleDescription")}
                  </Label>
                  <Textarea
                    id="ruleDescription"
                    value={ruleDescription}
                    onChange={(e) => setRuleDescription(e.target.value)}
                    placeholder={t(
                      "options.qrRules.dialog.ruleDescriptionPlaceholder"
                    )}
                    rows={2}
                  />
                </div>

                                  <div className="space-y-2">
                    <Label htmlFor="domainPattern">
                      {t("options.qrRules.dialog.domainPattern")}
                    </Label>
                    <Input
                      id="domainPattern"
                      value={domainPattern}
                      onChange={(e) => setDomainPattern(e.target.value)}
                      placeholder={t("options.qrRules.dialog.domainPatternPlaceholder")}
                    />
                    <p className="text-xs text-gray-500">
                      {t("options.qrRules.dialog.domainPatternDescription")}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="ruleEnabled"
                      checked={ruleEnabled}
                      onCheckedChange={setRuleEnabled}
                    />
                    <Label htmlFor="ruleEnabled">
                      {t("options.qrRules.dialog.ruleEnabled")}
                    </Label>
                  </div>
                </div>

              {/* 参数配置 */}
              <div className="space-y-4 border-t pt-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-lg font-medium">
                    {t("options.qrRules.dialog.parameters.title")}
                  </h4>
                  <Button onClick={addParameter} size="sm" variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    {t("options.qrRules.buttons.addParameter")}
                  </Button>
                </div>

                {editingParameters.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 border border-dashed border-gray-300 rounded">
                    <p>{t("options.qrRules.dialog.parameters.empty")}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {editingParameters.map((param, index) => (
                      <Card key={param.id} className="border border-gray-200">
                        <CardContent className="p-4 space-y-4">
                          <div className="flex justify-between items-center">
                            <h5 className="font-medium text-gray-900">
                              参数 {index + 1}
                            </h5>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteParameter(param.id)}
                              className="text-red-500 hover:text-red-700">
                              <Trash2 className="w-4 h-4" />
                              {t(
                                "options.qrRules.dialog.parameters.deleteParam"
                              )}
                            </Button>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>
                                {t(
                                  "options.qrRules.dialog.parameters.paramKey"
                                )}
                              </Label>
                              <Input
                                value={param.key}
                                onChange={(e) =>
                                  updateParameter(param.id, {
                                    key: e.target.value
                                  })
                                }
                                placeholder={t(
                                  "options.qrRules.dialog.parameters.paramKeyPlaceholder"
                                )}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>
                                {t(
                                  "options.qrRules.dialog.parameters.paramType"
                                )}
                              </Label>
                              <Select
                                value={param.type}
                                onValueChange={(value: QRRuleType) =>
                                  updateParameter(param.id, { type: value })
                                }>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value={QRRuleType.Fixed}>
                                    {t(
                                      "options.qrRules.dialog.parameters.fixedType"
                                    )}
                                  </SelectItem>
                                  <SelectItem value={QRRuleType.Input}>
                                    {t(
                                      "options.qrRules.dialog.parameters.inputType"
                                    )}
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {param.type === QRRuleType.Fixed ? (
                            <div className="space-y-2">
                              <Label>
                                {t(
                                  "options.qrRules.dialog.parameters.paramValue"
                                )}
                              </Label>
                              <Input
                                value={param.value || ""}
                                onChange={(e) =>
                                  updateParameter(param.id, {
                                    value: e.target.value
                                  })
                                }
                                placeholder={t(
                                  "options.qrRules.dialog.parameters.paramValuePlaceholder"
                                )}
                              />
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <Label>
                                {t(
                                  "options.qrRules.dialog.parameters.paramDefaultValue"
                                )}
                              </Label>
                              <Input
                                value={param.defaultValue || ""}
                                onChange={(e) =>
                                  updateParameter(param.id, {
                                    defaultValue: e.target.value
                                  })
                                }
                                placeholder={t(
                                  "options.qrRules.dialog.parameters.paramDefaultValuePlaceholder"
                                )}
                              />
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* 对话框底部按钮 */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={closeDialog}>
                  {t("options.qrRules.buttons.cancel")}
                </Button>
                <Button onClick={saveRule}>
                  {t("options.qrRules.buttons.save")}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  )
}
