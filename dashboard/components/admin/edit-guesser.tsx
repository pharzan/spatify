import type { ComponentProps, ReactNode } from "react";
import { useEffect, useState } from "react";
import type { InferredTypeMap } from "ra-core";
import {
  EditBase,
  InferredElement,
  useResourceContext,
  useEditContext,
  getElementsFromRecords,
} from "ra-core";
import { capitalize, singularize } from "inflection";
import { EditView } from "@/components/admin/edit";
import { SimpleForm } from "@/components/admin/simple-form";
import { TextInput } from "@/components/admin/text-input";
import { BooleanInput } from "@/components/admin/boolean-input";
import { ReferenceInput } from "@/components/admin/reference-input";
import { AutocompleteInput } from "@/components/admin/autocomplete-input";
import { ReferenceArrayInput } from "@/components/admin/reference-array-input";

export const EditGuesser = (props: { enableLog?: boolean }) => {
  return (
    <EditBase>
      <EditViewGuesser {...props} />
    </EditBase>
  );
};

const EditViewGuesser = (props: { enableLog?: boolean }) => {
  const resource = useResourceContext();

  if (!resource) {
    throw new Error(`Cannot use <EditGuesser> outside of a ResourceContext`);
  }

  const { record } = useEditContext();
  const [child, setChild] = useState<ReactNode>(null);
  const { enableLog = process.env.NODE_ENV === "development", ...rest } = props;

  useEffect(() => {
    setChild(null);
  }, [resource]);

  useEffect(() => {
    if (record && !child) {
      const inferredElements = getElementsFromRecords([record], editFieldTypes);
      const inferredChild = new InferredElement(
        editFieldTypes.form,
        null,
        inferredElements,
      );
      setChild(inferredChild.getElement());

      if (!enableLog) return;

      const representation = inferredChild.getRepresentation();

      const components = ["Edit"]
        .concat(
          Array.from(
            new Set(
              Array.from(representation.matchAll(/<([^/\s>]+)/g))
                .map((match) => match[1])
                .filter((component) => component !== "span"),
            ),
          ),
        )
        .sort();

      console.log(
        `Guessed Edit:

${components
  .map(
    (component) =>
      `import { ${component} } from "@/components/admin/${kebabCase(
        component,
      )}";`,
  )
  .join("\n")}

export const ${capitalize(singularize(resource))}Edit = () => (
    <Edit>
${representation}
    </Edit>
);`,
      );
    }
  }, [record, child, resource, enableLog]);

  return <EditView {...rest}>{child}</EditView>;
};

type RepresentationChild = { getRepresentation: () => string };

type ReferenceFieldProps = {
  source: string;
  reference?: string;
} & Record<string, unknown>;

const editFieldTypes: InferredTypeMap = {
  form: {
    component: (props: ComponentProps<typeof SimpleForm>) => (
      <SimpleForm {...props} />
    ),
    representation: (
      _props: Record<string, unknown>,
      children: RepresentationChild[],
    ) => `        <SimpleForm>
${children
  .map((child) => `            ${child.getRepresentation()}`)
  .join("\n")}
        </SimpleForm>`,
  },
  reference: {
    component: (props: ReferenceFieldProps) => (
      <ReferenceInput source={props.source} reference={props.reference}>
        <AutocompleteInput />
      </ReferenceInput>
    ),
    representation: (props: ReferenceFieldProps) =>
      `<ReferenceInput source="${props.source}" reference="${props.reference}">
                  <AutocompleteInput />
              </ReferenceInput>`,
  },
  referenceArray: {
    component: (props: ComponentProps<typeof ReferenceArrayInput>) => (
      <ReferenceArrayInput {...props} />
    ),
    representation: (props: ReferenceFieldProps) =>
      `<ReferenceArrayInput source="${props.source}" reference="${props.reference}" />`,
  },
  boolean: {
    component: (props: ComponentProps<typeof BooleanInput>) => (
      <BooleanInput {...props} />
    ),
    representation: (props: ReferenceFieldProps) =>
      `<BooleanInput source="${props.source}" />`,
  },
  string: {
    component: (props: ComponentProps<typeof TextInput>) => (
      <TextInput {...props} />
    ),
    representation: (props: ReferenceFieldProps) =>
      `<TextInput source="${props.source}" />`,
  },
};

const kebabCase = (name: string) => {
  return name
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
};
