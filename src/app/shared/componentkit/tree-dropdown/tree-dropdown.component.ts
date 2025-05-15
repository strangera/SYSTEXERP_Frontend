import { Component } from '@angular/core';

@Component({
  selector: 'app-tree-dropdown',
  templateUrl: './tree-dropdown.component.html',
  styleUrls: ['./tree-dropdown.component.scss'],
})
export class TreeDropdownComponent {
  members = [
    {
      department: 'Department A',
      roles: [
        {
          role: 'Owner',
          members: [
            { id: '1', name: 'Amy Elsner', email: 'amy@email.com', phone: '0911111111' },
            { id: '2', name: 'Anna Fali', email: 'anna@email.com', phone: '0922222222' },
          ],
        },
        {
          role: 'Viewer',
          members: [
            { id: '3', name: 'Asiya Javayant', email: 'asiya@email.com', phone: '0933333333' },
          ],
        },
      ],
    },
    {
      department: 'Department B',
      roles: [
        {
          role: 'Examiner',
          members: [
            { id: '4', name: 'Bernardo Dominic', email: 'bernardo@email.com', phone: '0944444444' },
          ],
        },
        {
          role: 'Reviewer',
          members: [
            { id: '5', name: 'Elwin Sharvill', email: 'elwin@email.com', phone: '0955555555' }
          ],
        },
      ],
    },
  ];

  selectedMembers: any[] = [];

  flattenMembers(members: any[]): any[] {
    let flattened: any[] = [];
    members.forEach((dept) => {
      dept.roles.forEach((role: { members: any }) => {
        flattened = [...flattened, ...role.members];
      });
    });
    return flattened;
  }

  inviteMembers() {
    console.log('Invited members:', this.selectedMembers);
    // 實作邀請邏輯
  }

  toggleSelection(item: any) {
    let membersToToggle: any[] = [];

    if (item.roles) {
      item.roles.forEach((role: { members: any[] }) => {
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
        (selected) =>
          !membersToToggle.some((member) => member.id === selected.id)
      );
    } else {
      const newMembers = membersToToggle.filter(
        (member) =>
          !this.selectedMembers.some((selected) => selected.id === member.id)
      );
      this.selectedMembers = [...this.selectedMembers, ...newMembers];
    }

    setTimeout(() => {
      this.selectedMembers = [...this.selectedMembers];
    }, 0);
  }

  onKeyDown(event: KeyboardEvent, member: any) {
    if (event.key === 'Enter' || event.key === ' ') {
      this.toggleSelection(member);
    }
  }

  isAnyMemberSelected(item: any): boolean {
    let members: any[] = [];

    if (item.roles) {
      item.roles.forEach((role: { members: any }) => {
        members.push(...role.members);
      });
    } else if (item.members) {
      members = item.members;
    }

    return members.some((member) =>
      this.selectedMembers.some((m) => m.id === member.id)
    );
  }
}