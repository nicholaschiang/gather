<script lang="ts">
  import * as Form from "$lib/components/ui/form"
  import { Input } from "$lib/components/ui/input"
  import { formSchema, type FormSchema } from "./schema"
  import {
    type SuperValidated,
    type Infer,
    superForm,
  } from "sveltekit-superforms"
  import { zodClient } from "sveltekit-superforms/adapters"

  let { data }: { data: { form: SuperValidated<Infer<FormSchema>> } } = $props()

  const form = superForm(data.form, { validators: zodClient(formSchema) })

  const { form: formData, enhance } = form
</script>

<form method="POST" use:enhance>
  <Form.Field {form} name="title">
    <Form.Control>
      {#snippet children({ props })}
        <Form.Label>Title</Form.Label>
        <Input {...props} bind:value={$formData.title} />
      {/snippet}
    </Form.Control>
    <Form.Description>The title of your gathering.</Form.Description>
    <Form.FieldErrors />
  </Form.Field>
  <Form.Field {form} name="description">
    <Form.Control>
      {#snippet children({ props })}
        <Form.Label>Description</Form.Label>
        <Input {...props} bind:value={$formData.description} />
      {/snippet}
    </Form.Control>
    <Form.Description>Give your gathering a description.</Form.Description>
    <Form.FieldErrors />
  </Form.Field>
  <Form.Button>Submit</Form.Button>
</form>
