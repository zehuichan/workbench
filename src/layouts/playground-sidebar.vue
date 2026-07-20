<script setup lang="ts">
import { useRoute } from 'vue-router';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/ui/sidebar';

defineOptions({ name: 'PlaygroundSidebar' });

export interface PlaygroundNavLink {
  to: string;
  label: string;
}

export interface PlaygroundNavGroup {
  name: string;
  links: PlaygroundNavLink[];
}

defineProps<{
  groups: PlaygroundNavGroup[];
}>();

const route = useRoute();
</script>

<template>
  <Sidebar collapsible="none" class="h-svh border-r">
    <SidebarHeader class="px-4 py-3">
      <div class="text-sm font-bold tracking-tight">Workbench</div>
    </SidebarHeader>
    <SidebarContent>
      <SidebarGroup v-for="group in groups" :key="group.name">
        <SidebarGroupLabel>{{ group.name }}</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem v-for="link in group.links" :key="link.to">
              <SidebarMenuButton as-child :is-active="route.path === link.to">
                <RouterLink :to="link.to">
                  <span>{{ link.label }}</span>
                </RouterLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  </Sidebar>
</template>
