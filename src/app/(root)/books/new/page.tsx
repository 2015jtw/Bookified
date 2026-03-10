import React from 'react';
import UploadForm from '@/components/UploadForm';

const Page = () => {
  return (
    <main className="wrapper container">
      <div className="mx-auto max-w-2xl space-y-10">
        <section className="flex flex-col gap-5">
          <h1 className="page-title-xl">Create New Book</h1>
          <p className="subtitle">
            Upload a PDF to generate your interactive AI conversation.
          </p>
        </section>
        <UploadForm />
      </div>
    </main>
  );
};

export default Page;
