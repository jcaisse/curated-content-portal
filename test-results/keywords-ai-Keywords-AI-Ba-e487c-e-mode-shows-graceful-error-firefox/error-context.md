# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - heading "Sign In" [level=3] [ref=e5]
    - generic [ref=e7]:
      - generic [ref=e8]:
        - generic [ref=e9]: Email
        - textbox "Email" [ref=e10]: admin@example.com
      - generic [ref=e11]:
        - generic [ref=e12]: Password
        - textbox "Password" [ref=e13]: testpassword123
      - generic [ref=e14]: Invalid credentials
      - button "Sign In" [ref=e15] [cursor=pointer]
  - alert [ref=e16]
```