import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { ConsentRecords } from "./_components/consent-records";
import { SarExports } from "./_components/sar-exports";

export default function PrivacyRecordsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-bold text-3xl tracking-tight">Consent &amp; access requests</h1>
        <p className="text-muted-foreground text-sm">
          What patients have agreed to or withdrawn, and when they have downloaded a copy of their own data. Read-only:
          IP addresses, free-text notes and the downloads themselves stay out of this screen.
        </p>
      </div>

      <Tabs defaultValue="consents">
        <TabsList>
          <TabsTrigger value="consents">Consent records</TabsTrigger>
          <TabsTrigger value="sar">Data access bundles</TabsTrigger>
        </TabsList>
        <TabsContent value="consents" className="pt-4">
          <ConsentRecords />
        </TabsContent>
        <TabsContent value="sar" className="pt-4">
          <SarExports />
        </TabsContent>
      </Tabs>
    </div>
  );
}
