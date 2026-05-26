import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Form,
  FormInput,
  FormSelect,
  FormDatePicker,
} from "@repo/ui"

// Define a schema using Zod for validation
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email.",
  }),
  role: z.string({
    message: "Please select a role.",
  }),
  birthDate: z.date().optional(),
})

type FormValues = z.infer<typeof formSchema>

export function FormDemo() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "",
    },
  })

  function onSubmit(values: FormValues) {
    console.log("Form Values:", values)
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>User Form Demo</CardTitle>
        <CardDescription>
          This form demonstrates the shadCN components with React Hook Form
          and Zod validation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormInput
              control={form.control}
              name="name"
              label="Full Name"
              placeholder="John Doe"
              description="Enter your full name"
            />

            <FormInput
              control={form.control}
              name="email"
              label="Email"
              type="email"
              placeholder="john@example.com"
              description="We'll never share your email"
            />

            <FormSelect
              control={form.control}
              name="role"
              label="Role"
              placeholder="Select a role"
              options={[
                { value: "admin", label: "Administrator" },
                { value: "user", label: "User" },
                { value: "guest", label: "Guest" },
              ]}
            />

            <FormDatePicker
              control={form.control}
              name="birthDate"
              label="Birth Date"
              placeholder="Select your birth date"
            />

            <Button type="submit" className="w-full">
              Submit
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
