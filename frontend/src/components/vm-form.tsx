import { useEffect, useState } from "react";
import { useForm, useFieldArray, useWatch, type Control } from "react-hook-form";
import { z } from "zod/v4";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Plus, X, ChevronsUpDown } from "lucide-react";
import type { VM, ADUser, RPMPackage } from "@/lib/types";
import { useADUsers, usePackages } from "@/hooks/use-vms";

const vmSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  cpu: z.coerce.number().int().min(1).max(128),
  ram: z.coerce.number().int().min(512),
  disk: z.coerce.number().int().min(1),
  os: z.string().min(1),
  network: z.enum(["office", "machine", "test"]),
  status: z.enum(["provisioning", "running", "stopped", "failed"]),
  users: z.array(
    z.object({
      username: z.string(),
      full_name: z.string(),
      is_sudoer: z.boolean(),
    })
  ),
  packages: z.array(
    z.object({
      name: z.string(),
      version: z.string(),
    })
  ),
});

type VMFormValues = z.infer<typeof vmSchema>;

interface VMFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vm: VM | null;
  onSubmit: (values: VMFormValues) => void;
  isPending: boolean;
}

export function VMForm({
  open,
  onOpenChange,
  vm,
  onSubmit,
  isPending,
}: VMFormProps) {
  const { data: adUsers = [] } = useADUsers();
  const { data: rpmPackages = [] } = usePackages();

  const form = useForm<VMFormValues>({
    resolver: zodResolver(vmSchema),
    defaultValues: {
      name: "",
      cpu: 2,
      ram: 4096,
      disk: 50,
      os: "RHEL 9",
      network: "office",
      status: "provisioning",
      users: [],
      packages: [],
    },
  });

  const {
    fields: userFields,
    append: appendUser,
    remove: removeUser,
  } = useFieldArray({ control: form.control, name: "users" });

  const {
    fields: pkgFields,
    append: appendPkg,
    remove: removePkg,
  } = useFieldArray({ control: form.control, name: "packages" });

  useEffect(() => {
    if (vm) {
      form.reset({
        name: vm.name,
        cpu: vm.cpu,
        ram: vm.ram,
        disk: vm.disk,
        os: vm.os,
        network: vm.network as "office" | "machine" | "test",
        status: vm.status as "provisioning" | "running" | "stopped",
        users: vm.users,
        packages: vm.packages,
      });
    } else {
      form.reset({
        name: "",
        cpu: 2,
        ram: 4096,
        disk: 50,
        os: "RHEL 9",
        network: "office",
        status: "provisioning",
        users: [],
        packages: [],
      });
    }
  }, [vm, form]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[500px] sm:w-[600px] sm:max-w-[600px] p-0">
        <SheetHeader className="px-6 pt-6 pb-4">
          <SheetTitle>{vm ? "Edit" : "Create"} Virtual Machine</SheetTitle>
          <SheetDescription>
            {vm
              ? "Modify the VM configuration below."
              : "Configure a new virtual machine."}
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-140px)] px-6 pb-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 pb-8"
            >
              {/* Basic fields */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Basic Configuration
                </h3>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="web-server-01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-3 gap-3">
                  <FormField
                    control={form.control}
                    name="cpu"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CPU (cores)</FormLabel>
                        <FormControl>
                          <Input type="number" min={1} max={128} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="ram"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>RAM (MB)</FormLabel>
                        <FormControl>
                          <Input type="number" min={512} step={512} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="disk"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Disk (GB)</FormLabel>
                        <FormControl>
                          <Input type="number" min={1} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="os"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Operating System</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="RHEL 9">RHEL 9</SelectItem>
                          <SelectItem value="RHEL 8">RHEL 8</SelectItem>
                          <SelectItem value="Ubuntu 24.04">
                            Ubuntu 24.04
                          </SelectItem>
                          <SelectItem value="Ubuntu 22.04">
                            Ubuntu 22.04
                          </SelectItem>
                          <SelectItem value="Debian 12">Debian 12</SelectItem>
                          <SelectItem value="Rocky Linux 9">
                            Rocky Linux 9
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="network"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Network</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="office">Office (OFLNET)</SelectItem>
                            <SelectItem value="machine">Machine (MNET)</SelectItem>
                            <SelectItem value="test">Test (TNET)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="provisioning">
                              Provisioning
                            </SelectItem>
                            <SelectItem value="running">Running</SelectItem>
                            <SelectItem value="stopped">Stopped</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Users section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Users
                  </h3>
                  <UserPicker
                    adUsers={adUsers}
                    existingUsernames={userFields.map((f) => f.username)}
                    onSelect={(user) =>
                      appendUser({
                        username: user.username,
                        full_name: user.full_name,
                        is_sudoer: false,
                      })
                    }
                  />
                </div>
                {userFields.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No users assigned. Add users from Active Directory.
                  </p>
                )}
                {userFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex items-center gap-3 rounded-md border p-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {field.full_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {field.username}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-muted-foreground">
                        sudo
                      </label>
                      <SudoerSwitch
                        control={form.control}
                        index={index}
                        onToggle={(checked) =>
                          form.setValue(`users.${index}.is_sudoer`, checked)
                        }
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeUser(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Packages section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Packages
                  </h3>
                  <PackagePicker
                    rpmPackages={rpmPackages}
                    existingNames={pkgFields.map((f) => f.name)}
                    onSelect={(pkg) =>
                      appendPkg({ name: pkg.name, version: pkg.version })
                    }
                  />
                </div>
                {pkgFields.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No packages selected. Add packages from the RPM repository.
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  {pkgFields.map((field, index) => (
                    <Badge
                      key={field.id}
                      variant="secondary"
                      className="gap-1 pr-1"
                    >
                      {field.name} ({field.version})
                      <button
                        type="button"
                        onClick={() => removePkg(index)}
                        className="ml-1 rounded-full hover:bg-muted p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={isPending} className="flex-1">
                  {isPending
                    ? vm
                      ? "Saving..."
                      : "Creating..."
                    : vm
                      ? "Save Changes"
                      : "Create VM"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

function SudoerSwitch({
  control,
  index,
  onToggle,
}: {
  control: Control<VMFormValues>;
  index: number;
  onToggle: (checked: boolean) => void;
}) {
  const isSudoer = useWatch({ control, name: `users.${index}.is_sudoer` });
  return <Switch checked={isSudoer} onCheckedChange={onToggle} />;
}

function UserPicker({
  adUsers,
  existingUsernames,
  onSelect,
}: {
  adUsers: ADUser[];
  existingUsernames: string[];
  onSelect: (user: ADUser) => void;
}) {
  const [open, setOpen] = useState(false);
  const available = adUsers.filter(
    (u) => !existingUsernames.includes(u.username)
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <Plus className="h-3 w-3" />
          Add User
          <ChevronsUpDown className="h-3 w-3 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="end">
        <Command>
          <CommandInput placeholder="Search AD users..." />
          <CommandList>
            <CommandEmpty>No users found.</CommandEmpty>
            <CommandGroup>
              {available.map((user) => (
                <CommandItem
                  key={user.username}
                  value={`${user.full_name} ${user.username}`}
                  onSelect={() => {
                    onSelect(user);
                    setOpen(false);
                  }}
                >
                  <div>
                    <p className="text-sm">{user.full_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.username} &middot; {user.department}
                    </p>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function PackagePicker({
  rpmPackages,
  existingNames,
  onSelect,
}: {
  rpmPackages: RPMPackage[];
  existingNames: string[];
  onSelect: (pkg: RPMPackage) => void;
}) {
  const [open, setOpen] = useState(false);
  const available = rpmPackages.filter(
    (p) => !existingNames.includes(p.name)
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <Plus className="h-3 w-3" />
          Add Package
          <ChevronsUpDown className="h-3 w-3 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="end">
        <Command>
          <CommandInput placeholder="Search packages..." />
          <CommandList>
            <CommandEmpty>No packages found.</CommandEmpty>
            <CommandGroup>
              {available.map((pkg) => (
                <CommandItem
                  key={pkg.name}
                  value={pkg.name}
                  onSelect={() => {
                    onSelect(pkg);
                    setOpen(false);
                  }}
                >
                  <div>
                    <p className="text-sm">
                      {pkg.name}{" "}
                      <span className="text-muted-foreground">
                        {pkg.version}
                      </span>
                    </p>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
