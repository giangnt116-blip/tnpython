export const questions = [
  {
    "id": 1,
    "category": "Biến và kiểu dữ liệu",
    "question": "Trong Python, để tạo một biến x có giá trị bằng 5, ta viết:",
    "options": {
      "A": "let x = 5",
      "B": "x = 5",
      "C": "x := 5",
      "D": "int x = 5"
    },
    "answer": "B"
  },
  {
    "id": 2,
    "category": "Biến và kiểu dữ liệu",
    "question": "Kết quả của type(5) là gì?",
    "options": {
      "A": "<class 'float'>",
      "B": "<class 'number'>",
      "C": "<class 'str'>",
      "D": "<class 'int'>"
    },
    "answer": "D"
  },
  {
    "id": 3,
    "category": "Biến và kiểu dữ liệu",
    "question": "Kết quả của type(5.0) là gì?",
    "options": {
      "A": "<class 'float'>",
      "B": "<class 'int'>",
      "C": "<class 'decimal'>",
      "D": "<class 'double'>"
    },
    "answer": "A"
  },
  {
    "id": 4,
    "category": "Biến và kiểu dữ liệu",
    "question": "Kết quả của đoạn code sau là gì?",
    "options": {
      "A": "False",
      "B": "True",
      "C": "Lỗi (Error)",
      "D": "5"
    },
    "answer": "A",
    "code": "x = \"5\"\ny = 5\nprint(x == y)"
  },
  {
    "id": 5,
    "category": "Biến và kiểu dữ liệu",
    "question": "Tên biến nào sau đây không hợp lệ trong Python?",
    "options": {
      "A": "1ten",
      "B": "Ten_1",
      "C": "_ten",
      "D": "ten1"
    },
    "answer": "A"
  },
  {
    "id": 6,
    "category": "Biến và kiểu dữ liệu",
    "question": "Hàm nào dùng để chuyển một chuỗi số như \"10\" thành số nguyên?",
    "options": {
      "A": "str()",
      "B": "int()",
      "C": "num()",
      "D": "float()"
    },
    "answer": "B"
  },
  {
    "id": 7,
    "category": "Biến và kiểu dữ liệu",
    "question": "Kết quả của bool(0) là gì?",
    "options": {
      "A": "True",
      "B": "False",
      "C": "0",
      "D": "Lỗi (Error)"
    },
    "answer": "B"
  },
  {
    "id": 8,
    "category": "Biến và kiểu dữ liệu",
    "question": "Kết quả của bool(\"\") (chuỗi rỗng) là gì?",
    "options": {
      "A": "\"\"",
      "B": "False",
      "C": "True",
      "D": "Lỗi (Error)"
    },
    "answer": "B"
  },
  {
    "id": 9,
    "category": "Biến và kiểu dữ liệu",
    "question": "Đoạn code sau in ra gì?",
    "options": {
      "A": "10mười",
      "B": "mười",
      "C": "10",
      "D": "Lỗi (Error) vì đổi kiểu dữ liệu"
    },
    "answer": "B",
    "code": "x = 10\nx = \"mười\"\nprint(x)"
  },
  {
    "id": 10,
    "category": "Biến và kiểu dữ liệu",
    "question": "Kết quả của 10 // 3 là gì?",
    "options": {
      "A": "3.33",
      "B": "3",
      "C": "3.0",
      "D": "1"
    },
    "answer": "B"
  },
  {
    "id": 11,
    "category": "Toán tử số học",
    "question": "Kết quả của 10 % 3 là gì?",
    "options": {
      "A": "0",
      "B": "3.33",
      "C": "1",
      "D": "3"
    },
    "answer": "C"
  },
  {
    "id": 12,
    "category": "Toán tử số học",
    "question": "Kết quả của 2 ** 3 là gì?",
    "options": {
      "A": "23",
      "B": "9",
      "C": "6",
      "D": "8"
    },
    "answer": "D",
    "sourceNote": "PDF hiển thị toán tử lũy thừa bị đảo vị trí do dàn trang; phần lời giải xác nhận biểu thức là 2 ** 3."
  },
  {
    "id": 13,
    "category": "Toán tử số học",
    "question": "Kết quả của 7 / 2 trong Python 3 là gì?",
    "options": {
      "A": "3",
      "B": "3.0",
      "C": "Lỗi (Error)",
      "D": "3.5"
    },
    "answer": "D"
  },
  {
    "id": 14,
    "category": "Toán tử số học",
    "question": "Kết quả của đoạn code sau là gì?",
    "options": {
      "A": "3",
      "B": "5",
      "C": "8",
      "D": "53"
    },
    "answer": "C",
    "code": "a = 5\na += 3\nprint(a)"
  },
  {
    "id": 15,
    "category": "Toán tử số học",
    "question": "Toán tử nào có độ ưu tiên cao nhất trong các toán tử sau?",
    "options": {
      "A": "+",
      "B": "*",
      "C": "**",
      "D": "-"
    },
    "answer": "C"
  },
  {
    "id": 16,
    "category": "Toán tử số học",
    "question": "Kết quả của -7 // 2 là gì?",
    "options": {
      "A": "3",
      "B": "-3",
      "C": "-3.5",
      "D": "-4"
    },
    "answer": "D"
  },
  {
    "id": 17,
    "category": "Toán tử số học",
    "question": "Kết quả của 3 + 4 * 2 là gì?",
    "options": {
      "A": "20",
      "B": "14",
      "C": "10",
      "D": "11"
    },
    "answer": "D"
  },
  {
    "id": 18,
    "category": "Toán tử số học",
    "question": "Đoạn code sau in ra gì?",
    "options": {
      "A": "10",
      "B": "25",
      "C": "2.5",
      "D": "7"
    },
    "answer": "B",
    "code": "x = 5\ny = 2\nprint(x ** y)"
  },
  {
    "id": 19,
    "category": "Toán tử số học",
    "question": "Hàm nào trả về giá trị tuyệt đối của một số?",
    "options": {
      "A": "round()",
      "B": "abs_val()",
      "C": "pow()",
      "D": "abs()"
    },
    "answer": "D"
  },
  {
    "id": 20,
    "category": "Toán tử số học",
    "question": "Kết quả của round(3.567, 2) là gì?",
    "options": {
      "A": "3.5",
      "B": "3.6",
      "C": "3.56",
      "D": "3.57"
    },
    "answer": "D"
  },
  {
    "id": 21,
    "category": "Toán tử so sánh và logic",
    "question": "Kết quả của 5 == 5.0 là gì?",
    "options": {
      "A": "None",
      "B": "True",
      "C": "Lỗi (Error)",
      "D": "False"
    },
    "answer": "B"
  },
  {
    "id": 22,
    "category": "Toán tử so sánh và logic",
    "question": "Kết quả của not True là gì?",
    "options": {
      "A": "False",
      "B": "True",
      "C": "0",
      "D": "None"
    },
    "answer": "A"
  },
  {
    "id": 23,
    "category": "Toán tử so sánh và logic",
    "question": "Kết quả của (5 > 3) and (2 > 4) là gì?",
    "options": {
      "A": "5",
      "B": "False",
      "C": "True",
      "D": "Lỗi (Error)"
    },
    "answer": "B"
  },
  {
    "id": 24,
    "category": "Toán tử so sánh và logic",
    "question": "Kết quả của (5 > 3) or (2 > 4) là gì?",
    "options": {
      "A": "True",
      "B": "Lỗi (Error)",
      "C": "False",
      "D": "2"
    },
    "answer": "A"
  },
  {
    "id": 25,
    "category": "Toán tử so sánh và logic",
    "question": "Toán tử nào dùng để kiểm tra hai giá trị khác nhau?",
    "options": {
      "A": "==",
      "B": "!=",
      "C": "=",
      "D": "<>"
    },
    "answer": "B"
  },
  {
    "id": 26,
    "category": "Toán tử so sánh và logic",
    "question": "Đoạn code sau in ra gì?",
    "options": {
      "A": "False",
      "B": "7",
      "C": "True",
      "D": "Lỗi (Error)"
    },
    "answer": "C",
    "code": "x = 7\nprint(x >= 7 and x <= 10)"
  },
  {
    "id": 27,
    "category": "Toán tử so sánh và logic",
    "question": "Kết quả của 5 in [1, 2, 3, 4, 5] là gì?",
    "options": {
      "A": "True",
      "B": "5",
      "C": "False",
      "D": "Lỗi (Error)"
    },
    "answer": "A"
  },
  {
    "id": 28,
    "category": "Toán tử so sánh và logic",
    "question": "Kết quả của not (5 > 3) là gì?",
    "options": {
      "A": "False",
      "B": "3",
      "C": "True",
      "D": "5"
    },
    "answer": "A"
  },
  {
    "id": 29,
    "category": "Toán tử so sánh và logic",
    "question": "Đâu là toán tử dùng để kiểm tra hai biến có cùng trỏ tới một đối tượng trong bộ nhớ?",
    "options": {
      "A": "is",
      "B": "equals",
      "C": "in",
      "D": "=="
    },
    "answer": "A"
  },
  {
    "id": 30,
    "category": "Toán tử so sánh và logic",
    "question": "Kết quả của đoạn code sau là gì?",
    "options": {
      "A": "10",
      "B": "False",
      "C": "5",
      "D": "True"
    },
    "answer": "D",
    "code": "a = 5\nb = 10\nprint(a != b)"
  },
  {
    "id": 31,
    "category": "Nhập/Xuất dữ liệu (input/print)",
    "question": "Hàm input() trong Python trả về kiểu dữ liệu gì?",
    "options": {
      "A": "float",
      "B": "Tuỳ theo dữ liệu người dùng nhập",
      "C": "int",
      "D": "str"
    },
    "answer": "D"
  },
  {
    "id": 32,
    "category": "Nhập/Xuất dữ liệu (input/print)",
    "question": "Để nhập một số nguyên từ bàn phím, ta viết:",
    "options": {
      "A": "x = int(input())",
      "B": "x = input()",
      "C": "x = number(input())",
      "D": "x = int input()"
    },
    "answer": "A"
  },
  {
    "id": 33,
    "category": "Nhập/Xuất dữ liệu (input/print)",
    "question": "Đoạn code sau in ra gì?",
    "options": {
      "A": "Lỗi (Error)",
      "B": "Hello World",
      "C": "HelloWorld",
      "D": "Hello, World"
    },
    "answer": "B",
    "code": "print(\"Hello\", \"World\")"
  },
  {
    "id": 34,
    "category": "Nhập/Xuất dữ liệu (input/print)",
    "question": "Để print() không tự động xuống dòng sau khi in, ta thêm tham số nào?",
    "options": {
      "A": "end=\"\"",
      "B": "newline=False",
      "C": "sep=\"\"",
      "D": "end=\"\""
    },
    "answer": "D",
    "sourceNote": "Tài liệu gốc lặp cùng nội dung end=\"\" ở cả A và D, trong khi đáp án công bố là D. Giữ nguyên để QA trước khi phát hành."
  },
  {
    "id": 35,
    "category": "Nhập/Xuất dữ liệu (input/print)",
    "question": "Đoạn code sau in ra gì?",
    "options": {
      "A": "Tôi tên {ten}, {tuoi} tuổi",
      "B": "Tôi tên An, 10 tuổi",
      "C": "Lỗi (Error)",
      "D": "Tôi tên ten, tuoi tuổi"
    },
    "answer": "B",
    "code": "ten = \"An\"\ntuoi = 10\nprint(f\"Tôi tên {ten}, {tuoi} tuổi\")"
  },
  {
    "id": 36,
    "category": "Nhập/Xuất dữ liệu (input/print)",
    "question": "Đoạn code sau in ra gì?",
    "options": {
      "A": "1 2 3",
      "B": "123",
      "C": "1-2-3",
      "D": "Lỗi (Error)"
    },
    "answer": "C",
    "code": "print(1, 2, 3, sep=\"-\")"
  },
  {
    "id": 37,
    "category": "Nhập/Xuất dữ liệu (input/print)",
    "question": "Lệnh nào sau đây gây lỗi khi người dùng nhập \"abc\"?",
    "options": {
      "A": "x = input(\"Nhập:\")",
      "B": "x = int(input())",
      "C": "x = str(input())",
      "D": "x = input()"
    },
    "answer": "B"
  },
  {
    "id": 38,
    "category": "Nhập/Xuất dữ liệu (input/print)",
    "question": "Đoạn code sau in ra gì?",
    "options": {
      "A": "53",
      "B": "8",
      "C": "5 3",
      "D": "Lỗi (Error)"
    },
    "answer": "A",
    "code": "a = \"5\"\nb = \"3\"\nprint(a + b)"
  },
  {
    "id": 39,
    "category": "Nhập/Xuất dữ liệu (input/print)",
    "question": "Cú pháp nào cho phép hiển thị lời nhắc khi gọi input()?",
    "options": {
      "A": "print(\"Nhập giá trị:\"); input()",
      "B": "input(\"Nhập giá trị:\")",
      "C": "input.prompt(\"Nhập giá trị:\")",
      "D": "input() + \"Nhập giá trị:\""
    },
    "answer": "B"
  },
  {
    "id": 40,
    "category": "Nhập/Xuất dữ liệu (input/print)",
    "question": "Đoạn code sau in ra gì (biết Python định dạng float mặc định)?",
    "options": {
      "A": "2",
      "B": "2.5",
      "C": "Lỗi (Error)",
      "D": "2.50"
    },
    "answer": "B",
    "code": "print(10 / 4)"
  },
  {
    "id": 41,
    "category": "Câu lệnh rẽ nhánh if - elif - else",
    "question": "Từ khoá nào dùng để kiểm tra một điều kiện khác nếu điều kiện if trước đó sai?",
    "options": {
      "A": "elif",
      "B": "elsif",
      "C": "elseif",
      "D": "else if"
    },
    "answer": "A"
  },
  {
    "id": 42,
    "category": "Câu lệnh rẽ nhánh if - elif - else",
    "question": "Đoạn code sau in ra gì?",
    "options": {
      "A": "Trung bình",
      "B": "Lớn",
      "C": "Nhỏ",
      "D": "Không in gì"
    },
    "answer": "A",
    "code": "x = 7\nif x > 10:\n    print(\"Lớn\")\nelif x > 5:\n    print(\"Trung bình\")\nelse:\n    print(\"Nhỏ\")"
  },
  {
    "id": 43,
    "category": "Câu lệnh rẽ nhánh if - elif - else",
    "question": "Điều gì đặc biệt trong cú pháp khối lệnh if của Python?",
    "options": {
      "A": "Dùng thụt đầu dòng (indentation) để xác định khối lệnh",
      "B": "Không cần dấu hai chấm :",
      "C": "Dùng từ khoá begin/end",
      "D": "Dùng dấu ngoặc nhọn {}"
    },
    "answer": "A"
  },
  {
    "id": 44,
    "category": "Câu lệnh rẽ nhánh if - elif - else",
    "question": "Đoạn code sau in ra gì?",
    "options": {
      "A": "Không in gì",
      "B": "A",
      "C": "B",
      "D": "C"
    },
    "answer": "C",
    "code": "x = 5\nif x > 0:\n    if x > 10:\n        print(\"A\")\n    else:\n        print(\"B\")\nelse:\n    print(\"C\")"
  },
  {
    "id": 45,
    "category": "Câu lệnh rẽ nhánh if - elif - else",
    "question": "Cú pháp if nào sau đây đúng trong Python?",
    "options": {
      "A": "if x > 5 print(x)",
      "B": "if (x > 5) { print(x) }",
      "C": "if x > 5 then print(x)",
      "D": "if x > 5: print(x)"
    },
    "answer": "D"
  },
  {
    "id": 46,
    "category": "Câu lệnh rẽ nhánh if - elif - else",
    "question": "Đoạn code sau in ra gì?",
    "options": {
      "A": "False nhánh",
      "B": "True nhánh",
      "C": "0",
      "D": "Lỗi (Error)"
    },
    "answer": "A",
    "code": "x = 0\nif x:\n    print(\"True nhánh\")\nelse:\n    print(\"False nhánh\")"
  },
  {
    "id": 47,
    "category": "Câu lệnh rẽ nhánh if - elif - else",
    "question": "Toán tử ba ngôi (biểu thức điều kiện trên một dòng) trong Python được viết theo cú pháp nào?",
    "options": {
      "A": "if condition then x else y",
      "B": "condition ? x : y",
      "C": "x ? y : condition",
      "D": "x if condition else y"
    },
    "answer": "D"
  },
  {
    "id": 48,
    "category": "Câu lệnh rẽ nhánh if - elif - else",
    "question": "Đoạn code sau in ra gì?",
    "options": {
      "A": "15",
      "B": "lẻ",
      "C": "Lỗi (Error)",
      "D": "chẵn"
    },
    "answer": "B",
    "code": "x = 15\nket_qua = \"chẵn\" if x % 2 == 0 else \"lẻ\"\nprint(ket_qua)"
  },
  {
    "id": 49,
    "category": "Câu lệnh rẽ nhánh if - elif - else",
    "question": "Nhánh elif có thể xuất hiện bao nhiêu lần trong một khối if?",
    "options": {
      "A": "Chỉ khi có else",
      "B": "Tối đa 1 lần",
      "C": "Tối đa 2 lần",
      "D": "Không giới hạn số lần"
    },
    "answer": "D"
  },
  {
    "id": 50,
    "category": "Câu lệnh rẽ nhánh if - elif - else",
    "question": "Đoạn code sau in ra gì?",
    "options": {
      "A": "Giỏi",
      "B": "Trung bình",
      "C": "Khá",
      "D": "Yếu"
    },
    "answer": "C",
    "code": "diem = 85\nif diem >= 90:\n    print(\"Giỏi\")\nelif diem >= 80:\n    print(\"Khá\")\nelif diem >= 65:\n    print(\"Trung bình\")\nelse:\n    print(\"Yếu\")"
  },
  {
    "id": 51,
    "category": "Vòng lặp for",
    "question": "Đoạn code sau in ra gì?",
    "options": {
      "A": "0 1 2 3 4 5",
      "B": "0 1 2 3 4",
      "C": "1 2 3 4",
      "D": "1 2 3 4 5"
    },
    "answer": "B",
    "code": "for i in range(5):\n    print(i, end=\" \")"
  },
  {
    "id": 52,
    "category": "Vòng lặp for",
    "question": "Đoạn code sau in ra gì?",
    "options": {
      "A": "2 4",
      "B": "0 1 2 3 4 5",
      "C": "2 3 4 5",
      "D": "2 3 4 5 6"
    },
    "answer": "C",
    "code": "for i in range(2, 6):\n    print(i, end=\" \")"
  },
  {
    "id": 53,
    "category": "Vòng lặp for",
    "question": "Đoạn code sau in ra gì?",
    "options": {
      "A": "0 2 4 6 8",
      "B": "1 3 5 7 9",
      "C": "2 4 6 8 10",
      "D": "0 1 2 3 4 5 6 7 8 9"
    },
    "answer": "A",
    "code": "for i in range(0, 10, 2):\n    print(i, end=\" \")"
  },
  {
    "id": 54,
    "category": "Vòng lặp for",
    "question": "Vòng lặp for trong Python thường được dùng để làm gì?",
    "options": {
      "A": "Thay thế hoàn toàn cho hàm",
      "B": "Duyệt qua các phần tử của một tập hợp (list, chuỗi, range,…)",
      "C": "Chỉ dùng cho số nguyên",
      "D": "Chỉ lặp vô hạn"
    },
    "answer": "B"
  },
  {
    "id": 55,
    "category": "Vòng lặp for",
    "question": "Đoạn code sau in ra gì?",
    "options": {
      "A": "abc-",
      "B": "a-b-c",
      "C": "Lỗi (Error)",
      "D": "a-b-c-"
    },
    "answer": "D",
    "code": "for ch in \"abc\":\n    print(ch, end=\"-\")"
  },
  {
    "id": 56,
    "category": "Vòng lặp for",
    "question": "Đoạn code sau in ra tổng bằng bao nhiêu?",
    "options": {
      "A": "4",
      "B": "15",
      "C": "10",
      "D": "6"
    },
    "answer": "C",
    "code": "tong = 0\nfor i in range(1, 5):\n    tong += i\nprint(tong)"
  },
  {
    "id": 57,
    "category": "Vòng lặp for",
    "question": "Từ khoá nào dùng để thoát khỏi vòng lặp for trước khi nó kết thúc tự nhiên?",
    "options": {
      "A": "exit",
      "B": "break",
      "C": "stop",
      "D": "end"
    },
    "answer": "B"
  },
  {
    "id": 58,
    "category": "Vòng lặp for",
    "question": "Từ khoá nào dùng để bỏ qua lần lặp hiện tại và tiếp tục với lần lặp kế tiếp?",
    "options": {
      "A": "continue",
      "B": "pass",
      "C": "next",
      "D": "skip"
    },
    "answer": "A"
  },
  {
    "id": 59,
    "category": "Vòng lặp for",
    "question": "Đoạn code sau in ra gì?",
    "options": {
      "A": "0 1 2 3",
      "B": "0 1 2",
      "C": "0 1 2 3 4",
      "D": "3"
    },
    "answer": "B",
    "code": "for i in range(5):\n    if i == 3:\n        break\n    print(i, end=\" \")"
  },
  {
    "id": 60,
    "category": "Vòng lặp for",
    "question": "Đoạn code sau in ra gì?",
    "options": {
      "A": "2",
      "B": "0 1",
      "C": "0 1 2 3 4",
      "D": "0 1 3 4"
    },
    "answer": "D",
    "code": "for i in range(5):\n    if i == 2:\n        continue\n    print(i, end=\" \")"
  },
  {
    "id": 61,
    "category": "Vòng lặp while",
    "question": "Vòng lặp while tiếp tục thực hiện khi nào?",
    "options": {
      "A": "Khi điều kiện là False",
      "B": "Khi điều kiện là True",
      "C": "Chỉ một lần duy nhất",
      "D": "Không có điều kiện"
    },
    "answer": "B"
  },
  {
    "id": 62,
    "category": "Vòng lặp while",
    "question": "Đoạn code sau in ra gì?",
    "options": {
      "A": "Lặp vô hạn",
      "B": "0 1 2",
      "C": "0 1 2 3",
      "D": "1 2 3"
    },
    "answer": "B",
    "code": "i = 0\nwhile i < 3:\n    print(i, end=\" \")\n    i += 1"
  },
  {
    "id": 63,
    "category": "Vòng lặp while",
    "question": "Đoạn code nào sau đây gây ra lặp vô hạn?",
    "options": {
      "A": "i = 5\nwhile i > 0:\n    print(i)\n    i -= 1",
      "B": "for i in range(5):\n    print(i)",
      "C": "i = 0\nwhile i < 5:\n    print(i)\n    i += 1",
      "D": "i = 0\nwhile i < 5:\n    print(i)"
    },
    "answer": "D"
  },
  {
    "id": 64,
    "category": "Vòng lặp while",
    "question": "Vòng lặp while True: kết hợp với lệnh nào để có thể dừng lại khi cần?",
    "options": {
      "A": "stop",
      "B": "break",
      "C": "end",
      "D": "exit()"
    },
    "answer": "B"
  },
  {
    "id": 65,
    "category": "Vòng lặp while",
    "question": "Đoạn code sau in ra tổng bao nhiêu?",
    "options": {
      "A": "10",
      "B": "20",
      "C": "5",
      "D": "15"
    },
    "answer": "D",
    "code": "tong = 0\ni = 1\nwhile i <= 5:\n    tong += i\n    i += 1\nprint(tong)"
  },
  {
    "id": 66,
    "category": "Vòng lặp while",
    "question": "Sự khác biệt chính giữa for và while trong Python là gì?",
    "options": {
      "A": "for thường dùng khi biết trước số lần lặp hoặc duyệt tập hợp; while dùng khi lặp phụ thuộc vào điều kiện",
      "B": "for chỉ dùng được với số nguyên",
      "C": "Không có sự khác biệt",
      "D": "while không thể dùng với break"
    },
    "answer": "A"
  },
  {
    "id": 67,
    "category": "Vòng lặp while",
    "question": "Đoạn code sau in ra gì?",
    "options": {
      "A": "Lặp vô hạn",
      "B": "10 9 8 7 6",
      "C": "9 8 7 6",
      "D": "10 9 8 7 6 5"
    },
    "answer": "B",
    "code": "i = 10\nwhile i > 0:\n    if i == 5:\n        break\n    print(i, end=\" \")\n    i -= 1"
  },
  {
    "id": 68,
    "category": "Vòng lặp while",
    "question": "while với else trong Python: khối else được thực hiện khi nào?",
    "options": {
      "A": "Mỗi lần lặp",
      "B": "Khi vòng lặp kết thúc bình thường (điều kiện trở thành False), không qua break",
      "C": "Khi có lỗi trong vòng lặp",
      "D": "Không bao giờ"
    },
    "answer": "B"
  },
  {
    "id": 69,
    "category": "Vòng lặp while",
    "question": "Đoạn code sau in ra gì?",
    "options": {
      "A": "2",
      "B": "0",
      "C": "3",
      "D": "4"
    },
    "answer": "C",
    "code": "dem = 0\nwhile dem < 3:\n    dem += 1\nprint(dem)"
  },
  {
    "id": 70,
    "category": "Vòng lặp while",
    "question": "Đoạn code sau dùng vòng lặp while để làm gì?",
    "options": {
      "A": "Lặp vô hạn không mục đích",
      "B": "In ra \"Không hợp lệ!\" mãi mãi",
      "C": "Gây lỗi chương trình",
      "D": "Bắt người dùng nhập lại cho đến khi nhập đúng một số nguyên"
    },
    "answer": "D",
    "code": "while True:\n    try:\n        n = int(input(\"Nhập số: \"))\n        break\n    except ValueError:\n        print(\"Không hợp lệ!\")"
  },
  {
    "id": 71,
    "category": "Chuỗi (string) cơ bản",
    "question": "Đoạn code sau in ra gì?",
    "options": {
      "A": "Lỗi (Error)",
      "B": "8",
      "C": "9",
      "D": "7"
    },
    "answer": "B",
    "code": "s = \"Xin chào\"\nprint(len(s))"
  },
  {
    "id": 72,
    "category": "Chuỗi (string) cơ bản",
    "question": "Đoạn code sau in ra gì?",
    "options": {
      "A": "Python",
      "B": "P",
      "C": "y",
      "D": "n"
    },
    "answer": "B",
    "code": "s = \"Python\"\nprint(s[0])"
  },
  {
    "id": 73,
    "category": "Chuỗi (string) cơ bản",
    "question": "Đoạn code sau in ra gì?",
    "options": {
      "A": "o",
      "B": "P",
      "C": "n",
      "D": "Lỗi (Error)"
    },
    "answer": "C",
    "code": "s = \"Python\"\nprint(s[-1])"
  },
  {
    "id": 74,
    "category": "Chuỗi (string) cơ bản",
    "question": "Đoạn code sau in ra gì?",
    "options": {
      "A": "hello",
      "B": "HELLO",
      "C": "Lỗi (Error)",
      "D": "Hello"
    },
    "answer": "B",
    "code": "s = \"Hello\"\nprint(s.upper())"
  },
  {
    "id": 75,
    "category": "Chuỗi (string) cơ bản",
    "question": "Phương thức nào dùng để nối các phần tử của một list thành một chuỗi?",
    "options": {
      "A": "\"\".concat(list)",
      "B": "list.merge(\"\")",
      "C": "\"\".join(list)",
      "D": "str(list)"
    },
    "answer": "C"
  },
  {
    "id": 76,
    "category": "Chuỗi (string) cơ bản",
    "question": "Đoạn code sau in ra gì?",
    "options": {
      "A": "Lỗi (Error)",
      "B": "\"Học Python\"",
      "C": "['Học', 'Python']",
      "D": "('Học', 'Python')"
    },
    "answer": "C",
    "code": "s = \"Học Python\"\nprint(s.split())"
  },
  {
    "id": 77,
    "category": "Chuỗi (string) cơ bản",
    "question": "Đoạn code sau in ra gì?",
    "options": {
      "A": "ython",
      "B": "yth",
      "C": "Pyt",
      "D": "ytho"
    },
    "answer": "B",
    "code": "s = \"Python\"\nprint(s[1:4])"
  },
  {
    "id": 78,
    "category": "Chuỗi (string) cơ bản",
    "question": "Chuỗi trong Python có thể thay đổi trực tiếp từng ký tự (mutable) hay không?",
    "options": {
      "A": "Có, dùng s[0] = 'a'",
      "B": "Không, chuỗi là kiểu bất biến (immutable)",
      "C": "Chỉ thay đổi được ký tự cuối",
      "D": "Tuỳ phiên bản Python"
    },
    "answer": "B"
  },
  {
    "id": 79,
    "category": "Chuỗi (string) cơ bản",
    "question": "Đoạn code sau in ra gì?",
    "options": {
      "A": "Lỗi (Error)",
      "B": "\"Xinchào\"",
      "C": "\" Xin chào \"",
      "D": "\"Xin chào\""
    },
    "answer": "D",
    "code": "s = \" Xin chào \"\nprint(s.strip())"
  },
  {
    "id": 80,
    "category": "Chuỗi (string) cơ bản",
    "question": "Đoạn code sau in ra gì?",
    "options": {
      "A": "Lỗi (Error)",
      "B": "Xin chào",
      "C": "Xin + chào",
      "D": "Xinchào"
    },
    "answer": "B",
    "code": "a = \"Xin\"\nb = \"chào\"\nprint(a + \" \" + b)"
  },
  {
    "id": 81,
    "category": "List cơ bản",
    "question": "Đoạn code sau in ra gì?",
    "options": {
      "A": "4",
      "B": "Lỗi (Error)",
      "C": "2",
      "D": "3"
    },
    "answer": "D",
    "code": "a = [1, 2, 3]\nprint(len(a))"
  },
  {
    "id": 82,
    "category": "List cơ bản",
    "question": "Phương thức nào dùng để thêm một phần tử vào cuối list?",
    "options": {
      "A": "add()",
      "B": "append()",
      "C": "push()",
      "D": "insert()"
    },
    "answer": "B"
  },
  {
    "id": 83,
    "category": "List cơ bản",
    "question": "Đoạn code sau in ra gì?",
    "options": {
      "A": "[4, 1, 2, 3]",
      "B": "[1, 2, 3, 4]",
      "C": "[1, 2, 3]",
      "D": "Lỗi (Error)"
    },
    "answer": "B",
    "code": "a = [1, 2, 3]\na.append(4)\nprint(a)"
  },
  {
    "id": 84,
    "category": "List cơ bản",
    "question": "Đoạn code sau in ra gì?",
    "options": {
      "A": "30",
      "B": "Lỗi (Error)",
      "C": "10",
      "D": "20"
    },
    "answer": "D",
    "code": "a = [10, 20, 30]\nprint(a[1])"
  },
  {
    "id": 85,
    "category": "List cơ bản",
    "question": "Phương thức nào dùng để xoá một phần tử theo giá trị trong list?",
    "options": {
      "A": "remove()",
      "B": "pop()",
      "C": "discard()",
      "D": "delete()"
    },
    "answer": "A"
  },
  {
    "id": 86,
    "category": "List cơ bản",
    "question": "Đoạn code sau in ra gì?",
    "options": {
      "A": "3",
      "B": "5",
      "C": "4",
      "D": "Lỗi (Error)"
    },
    "answer": "C",
    "code": "a = [1, 2, 3, 4, 5]\nprint(a[-2])"
  },
  {
    "id": 87,
    "category": "List cơ bản",
    "question": "Đoạn code sau in ra gì?",
    "options": {
      "A": "[1, 2, 3, 4]",
      "B": "[4]",
      "C": "Lỗi (Error)",
      "D": "[1, 2, 3]"
    },
    "answer": "A",
    "code": "a = [1, 2, 3]\nb = a\nb.append(4)\nprint(a)"
  },
  {
    "id": 88,
    "category": "List cơ bản",
    "question": "Hàm nào trả về tổng các phần tử số trong một list?",
    "options": {
      "A": "total()",
      "B": "count()",
      "C": "add()",
      "D": "sum()"
    },
    "answer": "D"
  },
  {
    "id": 89,
    "category": "List cơ bản",
    "question": "Đoạn code sau in ra gì?",
    "options": {
      "A": "[1, 1, 3, 4, 5]",
      "B": "Lỗi (Error)",
      "C": "[3, 1, 4, 1, 5]",
      "D": "[5, 4, 3, 1, 1]"
    },
    "answer": "A",
    "code": "a = [3, 1, 4, 1, 5]\na.sort()\nprint(a)"
  },
  {
    "id": 90,
    "category": "List cơ bản",
    "question": "Đoạn code sau in ra gì?",
    "options": {
      "A": "3",
      "B": "True",
      "C": "Lỗi (Error)",
      "D": "False"
    },
    "answer": "B",
    "code": "a = [1, 2, 3]\nprint(3 in a)"
  },
  {
    "id": 91,
    "category": "Hàm (function) cơ bản",
    "question": "Từ khoá nào dùng để định nghĩa một hàm trong Python?",
    "options": {
      "A": "func",
      "B": "define",
      "C": "function",
      "D": "def"
    },
    "answer": "D"
  },
  {
    "id": 92,
    "category": "Hàm (function) cơ bản",
    "question": "Đoạn code sau in ra gì?",
    "options": {
      "A": "34",
      "B": "Lỗi (Error)",
      "C": "None",
      "D": "7"
    },
    "answer": "D",
    "code": "def cong(a, b):\n    return a + b\nprint(cong(3, 4))"
  },
  {
    "id": 93,
    "category": "Hàm (function) cơ bản",
    "question": "Điều gì xảy ra nếu một hàm không có lệnh return?",
    "options": {
      "A": "Hàm trả về 0",
      "B": "Hàm trả về chuỗi rỗng",
      "C": "Hàm trả về None",
      "D": "Gây lỗi khi gọi hàm"
    },
    "answer": "C"
  },
  {
    "id": 94,
    "category": "Hàm (function) cơ bản",
    "question": "Đoạn code sau in ra gì?",
    "options": {
      "A": "Xin chào, bạn!",
      "B": "Xin chào, !",
      "C": "Xin chào, ten!",
      "D": "Lỗi (Error) vì thiếu tham số"
    },
    "answer": "A",
    "code": "def chao(ten=\"bạn\"):\n    print(f\"Xin chào, {ten}!\")\nchao()"
  },
  {
    "id": 95,
    "category": "Hàm (function) cơ bản",
    "question": "Tham số của hàm được gọi là gì khi truyền theo đúng tên, ví dụ chao(ten=\"An\")?",
    "options": {
      "A": "Positional argument (tham số theo vị trí)",
      "B": "Keyword argument (tham số theo tên)",
      "C": "Default argument",
      "D": "Global argument"
    },
    "answer": "B"
  },
  {
    "id": 96,
    "category": "Hàm (function) cơ bản",
    "question": "Đoạn code sau in ra gì?",
    "options": {
      "A": "None",
      "B": "7",
      "C": "25",
      "D": "10"
    },
    "answer": "D",
    "code": "def nhan(a, b):\n    ket_qua = a * b\n    return ket_qua\nx = nhan(2, 5)\nprint(x)"
  },
  {
    "id": 97,
    "category": "Hàm (function) cơ bản",
    "question": "Biến khai báo bên trong một hàm có phạm vi (scope) như thế nào?",
    "options": {
      "A": "Chỉ tồn tại và truy cập được bên trong hàm đó (biến cục bộ - local)",
      "B": "Gây lỗi khi khai báo",
      "C": "Tự động trở thành biến toàn cục",
      "D": "Có thể truy cập ở mọi nơi trong chương trình"
    },
    "answer": "A"
  },
  {
    "id": 98,
    "category": "Hàm (function) cơ bản",
    "question": "Đoạn code sau in ra gì?",
    "options": {
      "A": "None",
      "B": "chẵn",
      "C": "7",
      "D": "lẻ"
    },
    "answer": "D",
    "code": "def kiem_tra_chan_le(n):\n    if n % 2 == 0:\n        return \"chẵn\"\n    else:\n        return \"lẻ\"\nprint(kiem_tra_chan_le(7))"
  },
  {
    "id": 99,
    "category": "Hàm (function) cơ bản",
    "question": "Một hàm có thể trả về nhiều giá trị cùng lúc bằng cách nào?",
    "options": {
      "A": "Dùng return a, b (Python tự gói thành tuple)",
      "B": "Dùng nhiều lệnh return liên tiếp",
      "C": "Không thể, Python chỉ trả về một giá trị",
      "D": "Dùng từ khoá yield bắt buộc"
    },
    "answer": "A"
  },
  {
    "id": 100,
    "category": "Hàm (function) cơ bản",
    "question": "Đoạn code sau in ra gì?",
    "options": {
      "A": "10 4",
      "B": "(14, 6)",
      "C": "Lỗi (Error)",
      "D": "14 6"
    },
    "answer": "D",
    "code": "def tinh(a, b):\n    return a + b, a - b\ntong, hieu = tinh(10, 4)\nprint(tong, hieu)"
  }
];
