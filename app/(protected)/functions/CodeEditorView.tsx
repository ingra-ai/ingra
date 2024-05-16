'use client';
import { AuthSessionResponse } from '@app/auth/session';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FunctionForm } from './FunctionForm';
import { Prisma } from '@prisma/client';
import { useRouter } from 'next/navigation';

type CodeEditorViewProps = {
  authSession: AuthSessionResponse;
  functionRecord?: Prisma.FunctionGetPayload<{
    include: {
      arguments: true
    }
  }>
};

export const CodeEditorView: React.FC<CodeEditorViewProps> = (props) => {
  const {
    authSession,
    functionRecord
  } = props;
  const router = useRouter();

  const onSuccess = () => {
    router.replace('/functions');
    router.refresh();
  };

  const onCancel = () => {
    router.replace('/functions');
  };

  return (
    <Tabs id="code-editor-tabs" defaultValue="function-tab" className="">
      <TabsList>
        <TabsTrigger value="function-tab">Function</TabsTrigger>
        <TabsTrigger value="metadata-tab">Metadata</TabsTrigger>
      </TabsList>
      <TabsContent value="function-tab">
        <FunctionForm username={authSession.user.profile?.userName || ''} functionRecord={functionRecord} onSuccess={onSuccess} onCancel={onCancel} />
      </TabsContent>
      <TabsContent value="meta-tab">
        Coming soon
      </TabsContent>
    </Tabs>
  );
};
