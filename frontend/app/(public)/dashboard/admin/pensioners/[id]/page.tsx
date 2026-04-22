import PensionerProfileClient from "@/components/pensioner-[id]/PensionerProfileClient";
import { Id } from "@/convex/_generated/dataModel";
import React from "react";

export default async function PensionerProfilePage({
  params,
}: {
  params: Promise<{ id: Id<"pensioners"> }>;
}) {
  const { id } = await params;
  console.log("id is", id);
  return <PensionerProfileClient id={id} />;
}
