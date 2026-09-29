# GitHub Copilot 환경 사용자 지정하기

_개발 워크플로에 맞는 사용자 지정 지침, 프롬프트, 사용자 지정 에이전트로 GitHub Copilot의 동작을 조정해 보세요._

## 환영합니다

- **대상**: 특정 워크플로에 맞게 Copilot의 동작을 조정하려는 개발자와 교육자
- **학습 내용**: 사용 사례에 맞게 Copilot을 더 효과적으로 활용할 수 있도록 사용자 지정 지침, 에이전트 스킬, 사용자 지정 에이전트를 설정하는 방법
- **구현 결과**: 프로젝트 표준을 따르는 일관된 코드를 자동으로 생성하도록 지침, 에이전트 스킬, 사용자 지정 에이전트가 구성된 Copilot 환경
- **사전 요구 사항**: [GitHub Copilot 시작하기](https://github.com/skills/getting-started-with-github-copilot) 실습
- **소요 시간**: 30분 이내

이 실습에서는 다음 내용을 진행합니다.

1. Copilot에 필수 프로젝트 컨텍스트를 제공하는 리포지토리 전체 사용자 지정 지침 설정
1. 특정 파일 형식과 디렉터리에 적용되는 사용자 지정 지침 작성
1. 숙제 생성과 같은 일반적인 작업을 자동화하는 에이전트 스킬 작성
1. 전문 워크플로를 위한 사용자 지정 에이전트 구성

### 실습 시작 방법

실습을 여러분의 계정으로 복사한 다음, 좋아하는 Octocat인 Mona가 첫 번째 학습 단계를 준비하도록 **약 20초 동안** 기다렸다가 **페이지를 새로 고침**하세요.

[![](https://img.shields.io/badge/Copy%20Exercise-%E2%86%92-1f883d?style=for-the-badge&logo=github&labelColor=197935)](https://github.com/new?template_owner=skills&template_name=customize-your-github-copilot-experience&owner=%40me&name=skills-customize-your-github-copilot-experience&description=Exercise:+Customize+Your+GitHub+Copilot+Experience&visibility=public)

<details>
<summary>문제가 있나요? 🤷</summary><br/>

실습을 복사할 때 다음 설정을 권장합니다.

- 소유자는 리포지토리를 호스팅할 개인 계정이나 조직을 선택하세요.

- 비공개 리포지토리는 Actions 사용 시간을 소비하므로 공개 리포지토리로 만드는 것을 권장합니다.

20초 후에도 실습이 준비되지 않았다면 [Actions](../../actions) 탭을 확인하세요.

- 실행 중인 작업이 있는지 확인하세요. 경우에 따라 준비 시간이 조금 더 걸릴 수 있습니다.

- 실패한 작업이 표시되면 이슈를 등록해 주세요. 버그를 발견하셨습니다! 🐛

</details>

---

&copy; 2025 GitHub &bull; [Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/code_of_conduct.md) &bull; [MIT License](https://gh.io/mit)
