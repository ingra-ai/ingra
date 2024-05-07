'use client';
import { AuthSessionResponse } from '@app/auth/session';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FunctionForm } from './FunctionForm';
import { Prisma } from '@prisma/client';

type CodeEditorViewProps = {
  authSession: AuthSessionResponse;
  functionRecord?: Prisma.FunctionGetPayload<{
    include: {
      arguments: true
    }
  }>;
  onSuccess?: () => void;
};

export const CodeEditorView: React.FC<CodeEditorViewProps> = (props) => {
  const {
    authSession,
    functionRecord,
    onSuccess = () => void 0
  } = props;

  return (
    <Tabs id="code-editor-tabs" defaultValue="function-tab" className="">
      <TabsList>
        <TabsTrigger value="function-tab">Function</TabsTrigger>
        <TabsTrigger value="metadata-tab">Metadata</TabsTrigger>
      </TabsList>
      <TabsContent value="function-tab">
        <FunctionForm username={authSession.user.profile?.userName || ''} functionRecord={functionRecord} onSuccess={onSuccess} />
      </TabsContent>
      <TabsContent value="meta-tab">
        Metadata
      </TabsContent>
    </Tabs>
  );
};
