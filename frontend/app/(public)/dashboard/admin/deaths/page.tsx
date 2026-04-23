"use client";

import { useState } from "react";
import { useConvexUser } from "@/lib/useConvexUser";
import { useDeathsData } from "@/lib/useDeathsData";
import { useDeathActions } from "@/lib/useDeathActions";
import { TabBar, Tab } from "@/components/Deaths/TabBar";
import {
  ClaimsTab,
  DormantTab,
  DeceasedTab,
} from "@/components/Deaths/TabPanels";

export default function DeathsPage() {
  const { convexUserId } = useConvexUser();
  const [tab, setTab] = useState<Tab>("claims");

  const { allClaims, dormantList, deceasedList, pendingCount, dormantCount } =
    useDeathsData();

  const {
    submitting,
    handleApproveClaim,
    handleRejectClaim,
    handleDormantAction,
  } = useDeathActions(convexUserId);

  return (
    <div className=''>
      {/* Header */}
      <div className='bg-white border-b border-mist p-4 rounded-lg'>
        <h2 className='text-lg font-bold'>Death &amp; Dormancy Management</h2>
        <p style={{ fontSize: 10, color: "var(--muted)", marginTop: 1 }}>
          Review death claims, follow up on dormant pensioners, and maintain
          deceased records
        </p>
      </div>

      <TabBar
        activeTab={tab}
        onTabChange={setTab}
        pendingCount={pendingCount}
        dormantCount={dormantCount}
      />

      <div className='max-w-6xl mx-auto p-4'>
        {tab === "claims" && (
          <ClaimsTab
            claims={allClaims}
            submitting={submitting}
            onApprove={handleApproveClaim}
            onReject={handleRejectClaim}
          />
        )}

        {tab === "dormant" && (
          <DormantTab
            dormantList={dormantList}
            submitting={submitting}
            onAction={handleDormantAction}
          />
        )}

        {tab === "deceased" && <DeceasedTab deceasedList={deceasedList} />}
      </div>
    </div>
  );
}
