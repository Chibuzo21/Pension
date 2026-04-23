"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollText } from "lucide-react";
import AuditContent from "./card-Content";

export default function AuditLogsPage() {
  const logs = useQuery(api.users.getAuditLogs, { limit: 200 });

  return (
    <div className='space-y-5'>
      <div>
        <h2 className='text-lg font-semibold'>Audit Logs</h2>
        <p className='text-sm text-muted-foreground mt-0.5'>
          Complete action trail — every change is recorded
        </p>
      </div>

      <Card className='overflow-hidden'>
        <CardHeader className='pb-3 pt-4 px-4'>
          <CardTitle className='text-sm flex items-center gap-2'>
            <ScrollText className='h-4 w-4 text-muted-foreground' />
            Activity Log
            {logs && (
              <Badge variant='outline' className='ml-auto text-xs'>
                {logs.length} entries
              </Badge>
            )}
          </CardTitle>
        </CardHeader>

        <AuditContent />
      </Card>
    </div>
  );
}
