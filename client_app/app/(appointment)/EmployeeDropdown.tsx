import { greyFont } from "@/constants/style-vars";
import SalonEmployeeModel from "@/models/data-models/salonEmployeeModel";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import EmployeeInfoWithIcon from "./EmployeeInfoWithIcon";

interface EmployeeDropdownProps {
  employeeList: SalonEmployeeModel[];
  selectedEmployee: SalonEmployeeModel | null;
  setSelectedEmployee: React.Dispatch<React.SetStateAction<SalonEmployeeModel | null>>;
}

const EmployeeDropdown = ({
  employeeList,
  selectedEmployee,
  setSelectedEmployee,
}: EmployeeDropdownProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleEmployeeClicked = (employee: SalonEmployeeModel): void => {
    setSelectedEmployee(employee);
    setIsExpanded(false);
  };

  const renderDropdownItem = (employee: SalonEmployeeModel, isFirst: boolean) => (
    <TouchableOpacity key={employee.id} onPress={() => handleEmployeeClicked(employee)}>
      <EmployeeInfoWithIcon
        employee={employee}
        style={isFirst ? styles.firstDropdownItem : styles.dropdownItem}
      />
    </TouchableOpacity>
  );

  const renderDropdown = () => {
    return (
      <View style={styles.dropdown}>
        {employeeList.length !== 0 &&
          employeeList.map((emploee, i) => renderDropdownItem(emploee, i === 0))}
      </View>
    );
  };

  return (
    <View>
      <TouchableOpacity
        style={styles.dropdownHeader}
        onPress={() => setIsExpanded((prev) => !prev)}
      >
        {!!selectedEmployee ? (
          <EmployeeInfoWithIcon employee={selectedEmployee} />
        ) : (
          <Text>Wybierz osobę...</Text>
        )}
      </TouchableOpacity>
      {isExpanded && renderDropdown()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  dropdownHeader: {
    width: "100%",
    padding: 16,
    borderWidth: 2,
    borderColor: greyFont,
    borderRadius: 16,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: greyFont,
    borderRadius: 16,
  },
  dropdownItem: {
    borderTopColor: greyFont,
    borderTopWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  firstDropdownItem: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
});

export default EmployeeDropdown;
