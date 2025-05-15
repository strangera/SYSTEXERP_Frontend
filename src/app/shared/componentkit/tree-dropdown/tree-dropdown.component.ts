import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-tree-dropdown',
  templateUrl: './tree-dropdown.component.html',
  styleUrls: ['./tree-dropdown.component.scss'],
})
export class TreeDropdownComponent implements OnInit {
  members = [
    { id: '1', department: 'Department A', role: 'Owner', name: 'Amy Elsner', email: 'amy@email.com', phone: '0911111111' },
    { id: '2', department: 'Department A', role: 'Owner', name: 'Anna Fali', email: 'anna@email.com', phone: '0922222222' },
    { id: '3', department: 'Department A', role: 'Viewer', name: 'Asiya Javayant', email: 'asiya@email.com', phone: '0933333333' },
    { id: '4', department: 'Department B', role: 'Examiner', name: 'Bernardo Dominic', email: 'bernardo@email.com', phone: '0944444444' },
    { id: '5', department: 'Department B', role: 'Reviewer', name: 'Elwin Sharvill', email: 'elwin@email.com', phone: '0955555555' },
  ];

  selectedMembers: any[] = [];
  treeData: any[] = [];

  ngOnInit() {
    this.treeData = this.groupByDepartment();
  }

  groupByDepartment(): any[] {
    const grouped: any = {};
    this.members.forEach(member => {
      if (!grouped[member.department]) {
        grouped[member.department] = {};
      }
      if (!grouped[member.department][member.role]) {
        grouped[member.department][member.role] = [];
      }
      grouped[member.department][member.role].push(member);
    });

    return Object.keys(grouped).map(deptName => ({
      name: deptName,
      roles: Object.keys(grouped[deptName]).map(roleName => ({
        name: roleName,
        members: grouped[deptName][roleName]
      }))
    }));
  }

  inviteMembers() {
    console.log('Invited members:', this.selectedMembers);
    // 實作邀請邏輯
  }

  toggleSelection(item: any) {
    console.log('點到囉！', item);
    let membersToToggle: any[] = [];

    if (item.roles) {
      item.roles.forEach((role: any) => {
        membersToToggle.push(...role.members);
      });
    } else if (item.members) {
      membersToToggle = item.members;
    } else {
      membersToToggle = [item];
    }

    const allSelected = membersToToggle.every((member) =>
      this.selectedMembers.some((selected) => selected.id === member.id)
    );

    if (allSelected) {
      this.selectedMembers = this.selectedMembers.filter(
        (selected) => !membersToToggle.some((member) => member.id === selected.id)
      );
    } else {
      const newMembers = membersToToggle.filter(
        (member) => !this.selectedMembers.some((selected) => selected.id === member.id)
      );
      this.selectedMembers = [...this.selectedMembers, ...newMembers];
    }
  }

  onKeyDown(event: KeyboardEvent, item: any) {
    if (event.key === 'Enter' || event.key === ' ') {
      this.toggleSelection(item);
    }
  }

  isAnyMemberSelected(item: any): boolean {
    let members: any[] = [];

    if (item.roles) {
      item.roles.forEach((role: any) => {
        members.push(...role.members);
      });
    } else if (item.members) {
      members = item.members;
    } else {
      members = [item];
    }

    return members.some((member) =>
      this.selectedMembers.some((selected) => selected.id === member.id)
    );
  }
}
