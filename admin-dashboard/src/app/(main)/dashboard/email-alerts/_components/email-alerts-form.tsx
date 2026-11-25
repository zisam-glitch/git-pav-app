"use client";

import { useCallback, useEffect, useState } from "react";

import { Mail, Send } from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

interface Settings {
  enabled: boolean;
  recipients: string[];
  environmentRecipient: string | null;
  mailConfigured: boolean;
  effective: { source: "dashboard" | "environment" | "none"; recipients: string[]; enabled: boolean };
}

const SOURCE_TEXT: Record<Settings["effective"]["source"], string> = {
  dashboard: "the addresses saved on this page",
  environment: "the server's default address",
  none: "nobody yet",
};

const OFF_TEXT = {
  dashboard: "Alerts are switched off. Forms are still saved under Form Submissions.",
  none: "No address is set, so no alerts are sent. Forms are still saved under Form Submissions.",
};

export function EmailAlertsForm() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [enabled, setEnabled] = useState(true);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  const apply = useCallback((next: Settings) => {
    setSettings(next);
    setEnabled(next.enabled);
    setText(next.recipients.join("\n"));
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/v1/admin/settings/email-alerts");
        if (!res.ok) throw new Error("load failed");
        const json = (await res.json()) as Settings;
        if (!cancelled) apply(json);
      } catch {
        if (!cancelled) toast.error("Failed to load the email alert settings");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [apply]);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/v1/admin/settings/email-alerts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled, recipients: text }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Save failed");
      apply(json as Settings);
      toast.success("Email alert settings saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function sendTest() {
    setTesting(true);
    try {
      const res = await fetch("/api/v1/admin/settings/email-alerts/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipients: text }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "The test email did not send");
      toast.success(`Test email sent to ${(json.sentTo as string[]).join(", ")}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The test email did not send");
    } finally {
      setTesting(false);
    }
  }

  if (loading) return <p className="text-muted-foreground text-sm">Loading…</p>;
  if (!settings) return <p className="text-destructive text-sm">The settings could not be loaded.</p>;

  const target = settings.effective;
  return (
    <div className="flex max-w-2xl flex-col gap-4">
      {!settings.mailConfigured && (
        <Alert variant="destructive">
          <Mail />
          <AlertTitle>This server can't send email yet</AlertTitle>
          <AlertDescription>
            Your addresses will be saved, but no email goes out until the server has its Postmark token
            (POSTMARK_SERVER_TOKEN). Ask whoever looks after the hosting to add it.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Who gets the emails</CardTitle>
          <CardDescription>
            {target.enabled && target.recipients.length > 0 ? (
              <>
                Right now alerts go to <strong>{target.recipients.join(", ")}</strong> ({SOURCE_TEXT[target.source]}).
              </>
            ) : (
              OFF_TEXT[target.source === "dashboard" ? "dashboard" : "none"]
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
            <div className="flex flex-col gap-1">
              <Label htmlFor="alerts-enabled">Send an email for each new form</Label>
              <p className="text-muted-foreground text-xs">Turn off to stop all alert emails. Forms are still saved.</p>
            </div>
            <Switch id="alerts-enabled" checked={enabled} onCheckedChange={setEnabled} />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="alert-recipients">Email addresses</Label>
            <Textarea
              id="alert-recipients"
              rows={4}
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder={settings.environmentRecipient ?? "reception@example.com"}
              disabled={!enabled}
              spellCheck={false}
              autoComplete="off"
            />
            <p className="text-muted-foreground text-xs">
              One per line, or separated by commas. Up to 5.
              {settings.environmentRecipient
                ? ` Leave it empty to use the server's default, ${settings.environmentRecipient}.`
                : ""}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={save} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
            <Button variant="outline" onClick={sendTest} disabled={testing || !enabled}>
              <Send />
              {testing ? "Sending…" : "Send a test email"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <p className="text-muted-foreground text-xs">
        Health information never travels by email: alerts carry the sender's name and contact details only.
      </p>
    </div>
  );
}
