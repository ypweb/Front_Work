function nowTimeIndex () {
  let nowHour = new Date().getHours();
  switch (nowHour) {
    case 0:
      return 11;
    case 1:
      return 0;
    case 2:
      return 0;
    case 3:
      return 0;
    case 4:
      return 0;
    case 5:
      return 1;
    case 6:
      return 1;
    case 7:
      return 2;
    case 8:
      return 2;
    case 9:
      return 3;
    case 10:
      return 4;
    case 11:
      return 5;
    case 12:
      return 6;
    case 13:
      return 6;
    case 14:
      return 7;
    case 15:
      return 7;
    case 16:
      return 8;
    case 17:
      return 8;
    case 18:
      return 8;
    case 19:
      return 9;
    case 20:
      return 10;
    case 21:
      return 11;
    default:
      return 12;
  }
}

export default { nowTimeIndex }
