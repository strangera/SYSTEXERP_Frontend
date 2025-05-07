import { Component } from '@angular/core';

@Component({
  selector: 'app-tree-dropdown',
  templateUrl: './tree-dropdown.component.html',
  styleUrls: ['./tree-dropdown.component.scss'],
})
export class TreeDropdownComponent {
  // 樹狀結構資料
  members = [
    {
      department: 'Department A',
      roles: [
        {
          role: 'Owner',
          members: [
            { name: 'Amy Elsner', email: 'amy@email.com', role: 'Owner' },
            {
              name: 'Bernardo Dominic',
              email: 'bernardo@email.com',
              role: 'Owner',
            },
          ],
        },
        {
          role: 'Viewer',
          members: [
            { name: 'Ioni Bowcher', email: 'ioni@email.com', role: 'Viewer' },
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
            {
              name: 'Super Man',
              email: 'superman@email.com',
              role: 'Examiner',
            },
          ],
        },
        {
          role: 'Reviewer',
          members: [
            { name: 'Spider Man', email: 'spider@email.com', role: 'Reviewer' },
          ],
        },
      ],
    },
  ];

  selectedMembers: any[] = [];

  // 將樹狀結構展平成一維陣列以便於選擇
  flattenMembers(members: any[]): any[] {
    let flattened: any[] = [];
    members.forEach((dept) => {
      dept.roles.forEach((role: { members: any }) => {
        flattened = [...flattened, ...role.members];
      });
    });
    return flattened;
  }

  // 邀請選中的成員
  inviteMembers() {
    console.log('Invited members:', this.selectedMembers);
    // 這裡可以實作邀請邏輯
  }

  // 切換選擇狀態
  toggleSelection(member: any) {
    const index = this.selectedMembers.findIndex((m) => m.name === member.name);

    if (index === -1) {
      // 如果成員沒有被選中，就加入選擇列表
      this.selectedMembers.push(member);
    } else {
      // 如果成員已經被選中，就移除它
      this.selectedMembers.splice(index, 1);
    }

    // 強制刷新 p-multiSelect 顯示
    setTimeout(() => {
      // 使用 ngModel 更新後，強制刷新顯示
      this.selectedMembers = [...this.selectedMembers];
    }, 0);
  }

  // 鍵盤事件處理
  onKeyDown(event: KeyboardEvent, member: any) {
    if (event.key === 'Enter' || event.key === ' ') {
      this.toggleSelection(member);
    }
  }
}
