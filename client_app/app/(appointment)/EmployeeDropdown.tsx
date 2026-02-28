import { greyedOutFont, greyFont, lightGrey, primaryColor } from "@/constants/style-vars";
import { Fonts } from "@/constants/theme";
import SalonEmployeeModel from "@/models/data-models/salonEmployeeModel";
import { AntDesign } from "@expo/vector-icons";
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

  return (
    <View>
      <TouchableOpacity
        style={[styles.dropdownHeader, isExpanded && styles.dropdownHeaderActive]}
        onPress={() => setIsExpanded((prev) => !prev)}
      >
        {selectedEmployee ? (
          <EmployeeInfoWithIcon employee={selectedEmployee} />
        ) : (
          <Text style={styles.placeholderText}>Wybierz osobę...</Text>
        )}
        <AntDesign
          name={isExpanded ? "up" : "down"}
          size={16}
          color={greyFont}
        />
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.dropdown}>
          {employeeList.length === 0 ? (
            <Text style={styles.emptyText}>Brak pracowników</Text>
          ) : (
            employeeList.map((employee) => {
              const isSelected = selectedEmployee?.id === employee.id;
              return (
                <TouchableOpacity
                  key={employee.id}
                  style={[styles.dropdownItem, isSelected && styles.dropdownItemSelected]}
                  onPress={() => handleEmployeeClicked(employee)}
                >
                  <EmployeeInfoWithIcon employee={employee} />
                  {isSelected && (
                    <AntDesign name="check" size={16} color={primaryColor} />
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  dropdownHeader: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderWidth: 1,
    borderColor: lightGrey,
    borderRadius: 12,
    backgroundColor: "white",
  },
  dropdownHeaderActive: {
    borderColor: primaryColor,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  placeholderText: {
    color: greyedOutFont,
    fontFamily: Fonts.regular,
  },
  dropdown: {
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: primaryColor,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    backgroundColor: "white",
    overflow: "hidden",
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderTopColor: lightGrey,
    borderTopWidth: 1,
  },
  dropdownItemSelected: {
    backgroundColor: "#F0F4FF",
  },
  emptyText: {
    color: greyedOutFont,
    fontFamily: Fonts.regular,
    padding: 14,
    textAlign: "center",
  },
});

export default EmployeeDropdown;
