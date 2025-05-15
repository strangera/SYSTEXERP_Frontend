import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-tree-dropdown',
  templateUrl: './tree-dropdown.component.html',
  styleUrls: ['./tree-dropdown.component.scss'],
})
export class TreeDropdownComponent implements OnInit {
  members = [
    // department > role > member (其他細項)
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

    let deptIndex = 0;
    const result = Object.keys(grouped).map(deptName => {
      const rolesObj = grouped[deptName];
      let roleIndex = 0;

      const roles = Object.keys(rolesObj).map(roleName => {
        const members = rolesObj[roleName];
        let memberIndex = 0;

        const memberNodes = members.map((member: { name: any; email: any; phone: any; id: any; }) => ({
          key: `d${deptIndex}-r${roleIndex}-m${memberIndex++}`,
          label: member.name,
          data: {
            email: member.email,
            phone: member.phone,
            id: member.id
          },
          icon: 'pi pi-user',
          leaf: true
        }));

        roleIndex++;

        return {
          key: `d${deptIndex}-r${roleIndex}`,
          label: roleName,
          children: memberNodes,
          icon: 'pi pi-users'
        };
      });

      deptIndex++;

      return {
        key: `d${deptIndex}`,
        label: deptName,
        children: roles,
        icon: 'pi pi-folder'
      };
    });

    return result;
  }

  inviteMembers() {
    // 過濾出 leaf 節點 (會員層)
    const invited = this.selectedMembers
      .filter(node => node.leaf)
      .map(node => ({
        id: node.data.id,
        name: node.label,
        email: node.data.email,
        phone: node.data.phone
      }));

    console.log('Invited members:', invited);
  }
}
