"use client";

import DetailCardPageContainer from "../containers/DetailCardPageContainer";

interface DetailCardPageProps {
  projectName: string;
  cardId: string;
}

export default function DetailCardPage({
  projectName,
  cardId,
}: DetailCardPageProps) {
  return (
    <DetailCardPageContainer collectionName={projectName} cardId={cardId} />
  );
}
